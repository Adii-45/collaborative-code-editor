import { startProject, stopProject, getProjectStatus } from '../services/runnerService.js';

/**
 * @route   POST /api/run/start/:projectId
 * @desc    Start running a project
 * @access  Private
 */
export const start = async (req, res) => {
  try {
    const { projectId } = req.params;
    const io = req.app.get('io');

    const result = await startProject(projectId, io);
    res.json({ message: 'Project started', services: result.services });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @route   POST /api/run/stop/:projectId
 * @desc    Stop a running project
 * @access  Private
 */
export const stop = async (req, res) => {
  try {
    const { projectId } = req.params;
    const stopped = stopProject(projectId);
    if (stopped) {
      const io = req.app.get('io');
      io.to(projectId).emit('run:end', { code: 0 });
      res.json({ message: 'Project stopped' });
    } else {
      res.status(400).json({ message: 'No running process for this project' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   GET /api/run/status/:projectId
 * @desc    Get running status of a project
 * @access  Private
 */
export const status = async (req, res) => {
  const { projectId } = req.params;
  const state = getProjectStatus(projectId);
  res.json(state);
};
