import { exec } from 'child_process';
import util from 'util';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import Project from '../models/Project.js';
import { syncTreeToDisk } from '../utils/fsUtils.js';

const execPromise = util.promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPOS_DIR = path.join(__dirname, '..', 'repos');

// Ensure repos directory exists
fs.mkdir(REPOS_DIR, { recursive: true }).catch(console.error);

// Allowed exact commands
const ALLOWED_EXACT_COMMANDS = ['ls', 'pwd', 'npm install'];

/**
 * Validates if the command is allowed and safe.
 */
const isCommandAllowed = (command) => {
  const cmd = command.trim();

  // 1. Anti-chaining: block shell metacharacters
  if (/[&|;<>$`]/.test(cmd)) {
    return false;
  }

  // 2. Exact match check
  if (ALLOWED_EXACT_COMMANDS.includes(cmd)) {
    return true;
  }

  // 3. Pattern match for `node <filename>`
  // Allows `node file.js`, `node src/index.js`, etc. (no parent directories `../`)
  if (/^node\s+[\w\-\.\/]+$/.test(cmd) && !cmd.includes('../')) {
    return true;
  }

  return false;
};

/**
 * Execute a command string securely.
 * Returns { stdout, stderr, exitCode }.
 */
export const executeCommand = async (command, projectId, userId) => {
  try {
    if (!isCommandAllowed(command)) {
      return {
        stdout: '',
        stderr: 'Error: Command not allowed. Supported commands: ls, pwd, npm install, node <file>',
        exitCode: 1,
      };
    }

    // Ensure the project exists and fetch latest tree
    const project = await Project.findById(projectId);
    if (!project) {
      return { stdout: '', stderr: 'Error: Project not found', exitCode: 1 };
    }

    const localPath = path.join(REPOS_DIR, projectId.toString());

    // Ensure directory exists first
    await fs.mkdir(localPath, { recursive: true });

    // Sync latest file tree from DB to disk to ensure we run the latest code
    // (Only if there is a fileTree)
    if (project.fileTree) {
      await syncTreeToDisk(project.fileTree, localPath).catch(err => {
        console.error('Terminal sync to disk error:', err);
      });
    }

    // Execute the command in the project directory
    const { stdout, stderr } = await execPromise(command, {
      cwd: localPath,
      timeout: 15000, // 15 seconds max execution time
      maxBuffer: 1024 * 1024 * 5, // 5MB output buffer
    });

    return {
      stdout: stdout || '',
      stderr: stderr || '',
      exitCode: 0,
    };
  } catch (error) {
    return {
      stdout: error.stdout || '',
      stderr: error.stderr || error.message || 'Execution failed',
      exitCode: error.code || 1,
    };
  }
};
