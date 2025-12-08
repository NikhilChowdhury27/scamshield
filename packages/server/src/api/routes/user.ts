import { Router } from 'express';
import { userController } from '../controllers/user.js';

export const userRouter = Router();

// GET /api/v1/user - Get current user
userRouter.get('/', userController.getCurrent);

// GET /api/v1/user/preferences - Get user preferences
userRouter.get('/preferences', userController.getPreferences);

// PUT /api/v1/user/preferences - Update user preferences
userRouter.put('/preferences', userController.updatePreferences);
