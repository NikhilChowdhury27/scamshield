import type { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AnalysisInputSchema, createSuccessResponse } from '@scamshield/shared';
import { analysisService } from '../../services/analysis.js';
import { AppError } from '../../middleware/errorHandler.js';
import { logger } from '../../utils/logger.js';

// In-memory storage for async analysis status (replace with Redis in production)
const analysisStatus = new Map<string, { status: string; result?: unknown }>();

export const analyzeController = {
  /**
   * Analyze content for potential scams
   */
  async analyze(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { text } = req.body;
      const files = req.files as Express.Multer.File[] | undefined;

      // Validate input
      const validation = AnalysisInputSchema.safeParse({
        text,
        files: files?.map((f) => ({
          name: f.originalname,
          size: f.size,
          type: f.mimetype,
        })),
      });

      if (!validation.success) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Invalid input', {
          errors: validation.error.errors,
        });
      }

      const analysisId = uuidv4();

      // For quick analyses, respond synchronously
      logger.info('Starting analysis', { id: analysisId, hasText: !!text, fileCount: files?.length || 0 });

      const result = await analysisService.analyzeContent(text, files);

      const analysis = {
        ...result,
        id: analysisId,
        created_at: new Date(),
      };

      // Store result for potential status checks
      analysisStatus.set(analysisId, { status: 'completed', result: analysis });

      // Cleanup old status entries after 1 hour
      setTimeout(() => analysisStatus.delete(analysisId), 3600000);

      res.json(createSuccessResponse(analysis));
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get status of an analysis (for async operations)
   */
  async getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const status = analysisStatus.get(id);

      if (!status) {
        throw new AppError(404, 'NOT_FOUND', 'Analysis not found');
      }

      res.json(createSuccessResponse(status));
    } catch (error) {
      next(error);
    }
  },
};
