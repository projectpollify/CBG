import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * Authentication Routes
 * Base path: /api/auth
 */

// Public routes (no authentication required)
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);

// Protected routes (authentication required)
router.get('/me', authMiddleware, AuthController.me);

export default router;
