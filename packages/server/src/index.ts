import 'dotenv/config';
import { createServer } from './app.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';

const server = createServer();

server.listen(config.port, () => {
  logger.info(`ScamShield API server running on port ${config.port}`);
  logger.info(`Environment: ${config.nodeEnv}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
