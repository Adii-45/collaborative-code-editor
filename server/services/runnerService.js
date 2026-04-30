/**
 * Runner Service
 *
 * Manages project execution lifecycle:
 * - Detects project structure (frontend/backend/root)
 * - Spawns safe, predefined commands
 * - Streams stdout/stderr from multiple processes with prefixes
 * - Enforces one set of processes per project
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import Project from '../models/Project.js';
import { syncTreeToDisk } from '../utils/fsUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPOS_DIR = path.join(__dirname, '..', 'repos');

// projectId → { serviceName: { process, port, type } }
const activeProcesses = new Map();

/**
 * Detect available services in the project directory.
 */
const detectServices = async (projectDir) => {
  const services = [];

  // 1. Check for /client (Frontend)
  const clientPath = path.join(projectDir, 'client');
  if (existsSync(path.join(clientPath, 'package.json'))) {
    services.push({ name: 'frontend', cwd: clientPath, type: 'node' });
  }

  // 2. Check for /server (Backend)
  const serverPath = path.join(projectDir, 'server');
  if (existsSync(path.join(serverPath, 'package.json'))) {
    services.push({ name: 'backend', cwd: serverPath, type: 'node' });
  }

  // 3. If neither, check root package.json
  if (services.length === 0 && existsSync(path.join(projectDir, 'package.json'))) {
    services.push({ name: 'root', cwd: projectDir, type: 'node' });
  }

  // 4. Check for Python files if no Node services found at root
  if (services.length === 0) {
    const files = await fs.readdir(projectDir);
    if (files.some(f => f.endsWith('.py')) || files.includes('requirements.txt')) {
      services.push({ name: 'python', cwd: projectDir, type: 'python' });
    }
  }

  return services;
};

/**
 * Get run command and port for a service.
 */
const getServiceRunConfig = async (service) => {
  const { name, cwd, type } = service;

  if (type === 'node') {
    try {
      const pkgRaw = await fs.readFile(path.join(cwd, 'package.json'), 'utf8');
      const pkg = JSON.parse(pkgRaw);
      const scripts = pkg.scripts || {};
      
      let port = name === 'backend' ? 5000 : 3000;
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps['vite']) port = 5173;

      if (scripts.dev) return { cmd: 'npm', args: ['run', 'dev'], port };
      if (scripts.start) return { cmd: 'npm', args: ['start'], port };
      if (pkg.main) return { cmd: 'node', args: [pkg.main], port };
      return { cmd: 'node', args: ['index.js'], port };
    } catch {
      return { cmd: 'node', args: ['index.js'], port: 3000 };
    }
  }

  if (type === 'python') {
    const files = await fs.readdir(cwd);
    if (files.includes('main.py')) return { cmd: 'python3', args: ['main.py'], port: null };
    if (files.includes('app.py')) return { cmd: 'python3', args: ['app.py'], port: null };
    const firstPy = files.find(f => f.endsWith('.py'));
    return { cmd: 'python3', args: [firstPy || 'main.py'], port: null };
  }

  return null;
};

/**
 * Sync the project's fileTree from DB to disk.
 */
const syncProject = async (projectId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new Error('Project not found');

  const localPath = path.join(REPOS_DIR, projectId.toString());
  await fs.mkdir(localPath, { recursive: true });

  if (project.fileTree) {
    await syncTreeToDisk(project.fileTree, localPath);
  }
  return localPath;
};

/**
 * Run npm install for a service.
 */
const installDependencies = (service, io, projectId) => {
  return new Promise((resolve, reject) => {
    const { cwd, name } = service;
    if (existsSync(path.join(cwd, 'node_modules'))) {
      return resolve();
    }

    io.to(projectId).emit('run:log', { 
      type: 'info', 
      message: `[${name}] 📦 Installing dependencies...\n` 
    });

    const install = spawn('npm', ['install'], {
      cwd,
      env: { ...process.env, NODE_ENV: 'development' },
      shell: true,
    });

    install.stdout.on('data', (data) => {
      io.to(projectId).emit('run:log', { type: 'stdout', message: `[${name}] ${data.toString()}` });
    });
    install.stderr.on('data', (data) => {
      io.to(projectId).emit('run:log', { type: 'stderr', message: `[${name}] ${data.toString()}` });
    });

    install.on('close', (code) => {
      if (code === 0) {
        io.to(projectId).emit('run:log', { type: 'info', message: `[${name}] ✅ Dependencies installed.\n` });
        resolve();
      } else {
        reject(new Error(`[${name}] npm install failed with code ${code}`));
      }
    });

    install.on('error', (err) => reject(new Error(`[${name}] install error: ${err.message}`)));
  });
};

/**
 * Start a project with support for multiple services.
 */
export const startProject = async (projectId, io) => {
  // If already running, return existing state
  const existing = activeProcesses.get(projectId);
  if (existing) {
    return { alreadyRunning: true, services: Object.keys(existing) };
  }

  const projectDir = await syncProject(projectId);
  const detectedServices = await detectServices(projectDir);

  if (detectedServices.length === 0) {
    throw new Error('No runnable project structure detected (no package.json or python files).');
  }

  // 1. Sequential Install
  for (const service of detectedServices) {
    if (service.type === 'node') {
      try {
        await installDependencies(service, io, projectId);
      } catch (err) {
        io.to(projectId).emit('run:log', { type: 'stderr', message: `❌ ${err.message}\n` });
        throw err;
      }
    }
  }

  // 2. Parallel Start
  const projectState = {};
  activeProcesses.set(projectId, projectState);

  for (const service of detectedServices) {
    const config = await getServiceRunConfig(service);
    if (!config) continue;

    io.to(projectId).emit('run:log', {
      type: 'info',
      message: `[${service.name}] 🚀 Starting: ${config.cmd} ${config.args.join(' ')}\n`
    });

    const child = spawn(config.cmd, config.args, {
      cwd: service.cwd,
      env: { ...process.env, NODE_ENV: 'development', FORCE_COLOR: '1' },
      shell: true,
    });

    projectState[service.name] = { process: child, port: config.port, type: service.type };

    child.stdout.on('data', (data) => {
      io.to(projectId).emit('run:log', { type: 'stdout', message: `[${service.name}] ${data.toString()}` });
    });

    child.stderr.on('data', (data) => {
      io.to(projectId).emit('run:log', { type: 'stderr', message: `[${service.name}] ${data.toString()}` });
    });

    child.on('close', (code) => {
      io.to(projectId).emit('run:log', {
        type: 'info',
        message: `[${service.name}] ⏹ Process exited with code ${code}\n`
      });
      
      // Remove this service from state
      delete projectState[service.name];
      
      // If no services left, cleanup project
      if (Object.keys(projectState).length === 0) {
        activeProcesses.delete(projectId);
        io.to(projectId).emit('run:end', { code });
      }
    });

    child.on('error', (err) => {
      io.to(projectId).emit('run:log', {
        type: 'stderr',
        message: `[${service.name}] ❌ Error: ${err.message}\n`
      });
    });

    // If it's a frontend or root service with a port, emit started event for preview
    if (config.port && (service.name === 'frontend' || service.name === 'root')) {
      io.to(projectId).emit('run:started', { port: config.port });
    }
  }

  return { services: detectedServices.map(s => s.name) };
};

/**
 * Stop all processes for a project.
 */
export const stopProject = (projectId) => {
  const projectState = activeProcesses.get(projectId);
  if (!projectState) return false;

  for (const serviceName in projectState) {
    const { process: child } = projectState[serviceName];
    try {
      // Kill the process tree if possible
      process.kill(-child.pid, 'SIGTERM');
    } catch {
      try { child.kill('SIGTERM'); } catch { /* ignore */ }
    }
  }

  activeProcesses.delete(projectId);
  return true;
};

/**
 * Get detailed status of project execution.
 */
export const getProjectStatus = (projectId) => {
  const projectState = activeProcesses.get(projectId);
  if (!projectState) {
    return { status: 'stopped' };
  }

  // Find frontend or root port for preview
  let port = null;
  if (projectState.frontend?.port) port = projectState.frontend.port;
  else if (projectState.root?.port) port = projectState.root.port;

  return {
    status: 'running',
    services: Object.keys(projectState),
    port
  };
};

export const getStatus = (projectId) => {
  return activeProcesses.has(projectId) ? 'running' : 'stopped';
};
