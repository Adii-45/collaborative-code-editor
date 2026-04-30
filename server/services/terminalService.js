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

// Blocked exact commands or prefixes to prevent destructive operations
const BLOCKED_COMMANDS = [
  'rm', 'mv', 'sudo', 'su', 'reboot', 'shutdown', 'halt',
  'mkfs', 'dd', 'fdisk', 'mount', 'umount', 'chown', 'chmod',
  'iptables', 'ufw', 'firewall-cmd', 'systemctl', 'service',
  'kill', 'killall', 'pkill', 'top', 'htop'
];

/**
 * Validates if the command is allowed and safe.
 */
const isCommandAllowed = (command) => {
  const cmd = command.trim();
  const cmdParts = cmd.split(' ');
  const baseCommand = cmdParts[0].toLowerCase();

  // 1. Anti-chaining: block shell metacharacters that could bypass filters
  // (We allow > for basic output redirection, but block | & ; $ `)
  if (/[|;&$`]/.test(cmd)) {
    return false;
  }

  // 2. Block dangerous base commands
  if (BLOCKED_COMMANDS.includes(baseCommand)) {
    return false;
  }

  // 3. Block any command attempting to navigate up directory trees excessively
  // (We allow running files in subdirectories, but block trying to escape the repo)
  if (cmd.includes('../') || cmd.includes('..\\') || cmd.startsWith('/')) {
    // Only allow absolute paths if it's explicitly inside REPOS_DIR
    if (cmd.startsWith('/') && !cmd.includes(REPOS_DIR)) {
      return false;
    }
  }

  return true;
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
        stderr: 'Error: Command blocked for security reasons.',
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
