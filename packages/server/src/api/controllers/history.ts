import type { Request, Response, NextFunction } from 'express';
import { PaginationParamsSchema, createSuccessResponse } from '@scamshield/shared';
import { AppError } from '../../middleware/errorHandler.js';

// In-memory storage (replace with database in production)
const historyStore = new Map<string, unknown>();

export const historyController = {
  /**
   * Get all history items
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = PaginationParamsSchema.parse(req.query);

      const items = Array.from(historyStore.values());

      // Simple pagination
      const start = (params.page - 1) * params.limit;
      const paginatedItems = items.slice(start, start + params.limit);

      res.json(createSuccessResponse(paginatedItems, {
        pagination: {
          page: params.page,
          limit: params.limit,
          total: items.length,
          total_pages: Math.ceil(items.length / params.limit),
        },
      }));
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get single history item by ID
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const item = historyStore.get(id);

      if (!item) {
        throw new AppError(404, 'NOT_FOUND', 'History item not found');
      }

      res.json(createSuccessResponse(item));
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete single history item
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!historyStore.has(id)) {
        throw new AppError(404, 'NOT_FOUND', 'History item not found');
      }

      historyStore.delete(id);

      res.json(createSuccessResponse({ deleted: true }));
    } catch (error) {
      next(error);
    }
  },

  /**
   * Clear all history
   */
  async clearAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const count = historyStore.size;
      historyStore.clear();

      res.json(createSuccessResponse({ deleted: count }));
    } catch (error) {
      next(error);
    }
  },
};
