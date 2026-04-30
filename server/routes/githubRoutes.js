import express from 'express';
import { connectGitHub, importRepo, importRepoByUrl, commitAndPush, fetchUserRepos } from '../controllers/githubController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All GitHub routes are protected
router.use(protect);

router.post('/connect', connectGitHub);
router.get('/repos', fetchUserRepos);
router.post('/import', importRepo);        // Legacy: import into existing project
router.post('/import-url', importRepoByUrl); // New: auto-create project from URL
router.post('/commit', commitAndPush);

export default router;
