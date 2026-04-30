import express from 'express';
import { signup, login, getMe } from '../controllers/authController.js';
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

export default router;
