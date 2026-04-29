import express from 'express';
import {
  createProject,
  getMyProjects,
  getProject,
  updateFileTree,
  deleteProject,
  renameProject,
  inviteEmail,
  inviteLink
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
  .put(renameProject)
  .delete(deleteProject);

router.put('/:id/tree', updateFileTree);
router.post('/:id/invite-email', inviteEmail);
router.post('/:id/invite-link', inviteLink);

export default router;
