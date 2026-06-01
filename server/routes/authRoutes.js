import express from 'express';
import { signup, login, getMe, updateWorkspaceSettings, updatePassword } from '../controllers/authController.js';
import { githubLogin, githubCallback } from '../controllers/githubAuthController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// GitHub OAuth routes
router.get('/github', githubLogin);
router.get('/github/callback', githubCallback);

// Protected routes
router.get('/me', protect, getMe);
router.put('/workspace', protect, updateWorkspaceSettings);
router.put('/password', protect, updatePassword);

export default router;
