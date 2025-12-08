import { Router } from 'express';
import multer from 'multer';
import { analyzeController } from '../controllers/analyze.js';
import { analysisRateLimiter } from '../../middleware/rateLimiter.js';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max
    files: 10,
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'audio/mpeg',
      'audio/wav',
      'audio/webm',
      'audio/ogg',
      'audio/mp4',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not supported`));
    }
  },
});

export const analyzeRouter = Router();

// POST /api/v1/analyze - Analyze content for scams
analyzeRouter.post(
  '/',
  analysisRateLimiter,
  upload.array('files', 10),
  analyzeController.analyze
);

// GET /api/v1/analyze/:id/status - Get analysis status (for async operations)
analyzeRouter.get('/:id/status', analyzeController.getStatus);
