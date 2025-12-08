import { Router } from 'express';
import { analyzeRouter } from './analyze.js';
import { historyRouter } from './history.js';
import { chatRouter } from './chat.js';
import { searchRouter } from './search.js';
import { userRouter } from './user.js';

export const apiRouter = Router();

// Mount route modules
apiRouter.use('/analyze', analyzeRouter);
apiRouter.use('/history', historyRouter);
apiRouter.use('/chat', chatRouter);
apiRouter.use('/search', searchRouter);
apiRouter.use('/user', userRouter);

// API health check
apiRouter.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date(),
    },
  });
});
