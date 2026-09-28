/**
 * /api/auth routes
 */
import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimit.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { loginSchema } from '../middleware/validators.js';
import { validate } from '../middleware/validate.js';

export const authRouter = Router();

authRouter.post('/login', loginLimiter, validate(loginSchema), asyncHandler(authController.login));
authRouter.get('/me', requireAuth, asyncHandler(authController.me));
authRouter.post('/logout', requireAuth, asyncHandler(authController.logout));
