import express from 'express';
import { start, stop, status } from '../controllers/runnerController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/start/:projectId', start);
router.post('/stop/:projectId', stop);
router.get('/status/:projectId', status);

export default router;
