import express from 'express';
import {
  createProject,
  getMyProjects,
  getProject,
  updateFileTree,
  deleteProject,
  addCollaborator,
} from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All project routes are protected
router.use(protect);

router.route('/')
  .get(getMyProjects)
  .post(createProject);

router.route('/:id')
  .get(getProject)
  .delete(deleteProject);

router.put('/:id/tree', updateFileTree);
router.post('/:id/collaborators', addCollaborator);

export default router;
