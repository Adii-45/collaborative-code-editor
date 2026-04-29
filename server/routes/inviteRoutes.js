import express from 'express';
import { acceptInvite } from '../controllers/inviteController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protected route: User must be logged in to accept an invite
router.post('/:token', protect, acceptInvite);

export default router;
