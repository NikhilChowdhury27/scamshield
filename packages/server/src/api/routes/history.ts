import { Router } from 'express';
import { historyController } from '../controllers/history.js';

export const historyRouter = Router();

// GET /api/v1/history - Get analysis history
historyRouter.get('/', historyController.getAll);

// GET /api/v1/history/:id - Get single history item
historyRouter.get('/:id', historyController.getById);

// DELETE /api/v1/history/:id - Delete history item
historyRouter.delete('/:id', historyController.delete);

// DELETE /api/v1/history - Clear all history
historyRouter.delete('/', historyController.clearAll);
