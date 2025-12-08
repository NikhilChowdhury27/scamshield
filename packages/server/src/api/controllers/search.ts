import type { Request, Response, NextFunction } from 'express';
import { SearchVerifyRequestSchema, createSuccessResponse } from '@scamshield/shared';
import { analysisService } from '../../services/analysis.js';
import { AppError } from '../../middleware/errorHandler.js';

export const searchController = {
  /**
   * Verify potential scam with web search
   */
  async verify(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = SearchVerifyRequestSchema.safeParse(req.body);

      if (!validation.success) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Invalid search request', {
          errors: validation.error.errors,
        });
      }

      const { query, context } = validation.data;
      const searchQuery = context ? `${query} ${context}` : query;

      const result = await analysisService.verifyWithSearch(searchQuery);

      res.json(createSuccessResponse({
        query,
        result: result.text,
        sources: result.sources,
        verified_at: new Date(),
      }));
    } catch (error) {
      next(error);
    }
  },
};
