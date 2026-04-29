import express from 'express';
import { execute } from '../controllers/terminalController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protected: only authenticated users can execute commands
router.post('/run', protect, execute);

export default router;
