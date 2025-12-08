import { Router } from 'express';
import { searchController } from '../controllers/search.js';

export const searchRouter = Router();

// POST /api/v1/search/verify - Verify scam with web search
searchRouter.post('/verify', searchController.verify);
