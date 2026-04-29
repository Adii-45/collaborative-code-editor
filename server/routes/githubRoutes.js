import express from 'express';
import { connectGitHub, importRepo, commitAndPush } from '../controllers/githubController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All GitHub routes are protected
router.use(protect);

router.post('/connect', connectGitHub);
router.post('/import', importRepo);
router.post('/commit', commitAndPush);

export default router;
