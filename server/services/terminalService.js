/**
 * Terminal Service
 * 
 * Provides sandboxed command execution. Currently supports a limited set
 * of safe commands. Architecture is designed so that future integration
 * with Docker containers or node-pty can replace the executeCommand function
 * without changing the controller or route layer.
 */

// Whitelist of allowed "simulated" commands
const ALLOWED_COMMANDS = ['echo', 'help', 'date', 'whoami', 'pwd', 'ls', 'node', 'clear'];

/**
 * Execute a command string in a sandboxed manner.
 * Returns { stdout, stderr, exitCode }.
 * 
 * FUTURE: Replace this with Docker-based execution or node-pty.
 */
export const executeCommand = async (command, userId) => {
  const parts = command.trim().split(/\s+/);
  const cmd = parts[0];
  const args = parts.slice(1).join(' ');

  try {
    switch (cmd) {
      case 'echo':
        return { stdout: args || '', stderr: '', exitCode: 0 };

      case 'help':
        return {
          stdout: 'Available commands: echo, help, date, whoami, pwd, ls, node -e "<code>", clear',
          stderr: '',
          exitCode: 0,
        };

      case 'date':
        return { stdout: new Date().toString(), stderr: '', exitCode: 0 };

      case 'whoami':
        return { stdout: `user_${userId?.toString().slice(-6) || 'anonymous'}`, stderr: '', exitCode: 0 };

      case 'pwd':
        return { stdout: '/home/user/project', stderr: '', exitCode: 0 };

      case 'ls':
        return { stdout: '(file listing requires project context)', stderr: '', exitCode: 0 };

      case 'clear':
        return { stdout: '', stderr: '', exitCode: 0, clear: true };

      case 'node': {
        // Simple JS evaluation with timeout for safety
        if (parts[1] !== '-e' || !args.includes('-e')) {
          return { stdout: '', stderr: 'Usage: node -e "<javascript code>"', exitCode: 1 };
        }
        const code = command.replace(/^node\s+-e\s+/, '').replace(/^["']|["']$/g, '');
        try {
          // Capture console.log output
          const logs = [];
          const mockConsole = { log: (...a) => logs.push(a.map(String).join(' ')), error: (...a) => logs.push(a.map(String).join(' ')) };
          
          // Create a sandboxed function (basic safety, NOT production-grade)
          const fn = new Function('console', code);
          
          // Execute with a timeout
          const result = await Promise.race([
            new Promise((resolve) => {
              fn(mockConsole);
              resolve(logs.join('\n'));
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Execution timed out (5s limit)')), 5000)),
          ]);

          return { stdout: result || '', stderr: '', exitCode: 0 };
        } catch (evalErr) {
          return { stdout: '', stderr: evalErr.message, exitCode: 1 };
        }
      }

      default:
        return {
          stdout: '',
          stderr: `bash: ${cmd}: command not found`,
          exitCode: 127,
        };
    }
  } catch (error) {
    return { stdout: '', stderr: error.message, exitCode: 1 };
  }
};
