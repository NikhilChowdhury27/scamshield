import type { Request, Response, NextFunction } from 'express';
import { UpdateUserPreferencesSchema, createSuccessResponse } from '@scamshield/shared';
import { AppError } from '../../middleware/errorHandler.js';

// Default preferences (in production, this would come from a database)
const defaultPreferences = {
  theme: 'system' as const,
  fontSize: 'medium' as const,
  language: 'en',
  notifications: {
    email: false,
    push: false,
    sms: false,
  },
  accessibility: {
    reduceMotion: false,
    highContrast: false,
    screenReader: false,
  },
};

// In-memory storage for user preferences (replace with database in production)
const userPreferences = new Map<string, typeof defaultPreferences>();

export const userController = {
  /**
   * Get current user info
   */
  async getCurrent(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // In production, this would get the authenticated user
      const user = {
        id: 'anonymous',
        created_at: new Date(),
        updated_at: new Date(),
        preferences: userPreferences.get('anonymous') || defaultPreferences,
      };

      res.json(createSuccessResponse(user));
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get user preferences
   */
  async getPreferences(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const preferences = userPreferences.get('anonymous') || defaultPreferences;
      res.json(createSuccessResponse(preferences));
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update user preferences
   */
  async updatePreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = UpdateUserPreferencesSchema.safeParse(req.body);

      if (!validation.success) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Invalid preferences', {
          errors: validation.error.errors,
        });
      }

      const currentPreferences = userPreferences.get('anonymous') || defaultPreferences;
      const updatedPreferences = {
        ...currentPreferences,
        ...validation.data,
        notifications: {
          ...currentPreferences.notifications,
          ...validation.data.notifications,
        },
        accessibility: {
          ...currentPreferences.accessibility,
          ...validation.data.accessibility,
        },
      };

      userPreferences.set('anonymous', updatedPreferences);

      res.json(createSuccessResponse(updatedPreferences));
    } catch (error) {
      next(error);
    }
  },
};
