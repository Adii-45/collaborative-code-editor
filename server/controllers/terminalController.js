import { executeCommand } from '../services/terminalService.js';

/**
 * @route   POST /api/terminal/run
 * @desc    Execute a terminal command (sandboxed)
 * @access  Private
 */
export const execute = async (req, res) => {
  try {
    const { command, projectId } = req.body;

    if (!command || !command.trim()) {
      return res.status(400).json({ message: 'Command is required' });
    }
    
    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const result = await executeCommand(command, projectId, req.user._id);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      stdout: '',
      stderr: 'Internal server error during command execution',
      exitCode: 1,
    });
  }
};
