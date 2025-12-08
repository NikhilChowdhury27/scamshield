import { Router } from 'express';
import { chatController } from '../controllers/chat.js';

export const chatRouter = Router();

// POST /api/v1/chat - Send a chat message
chatRouter.post('/', chatController.sendMessage);

// GET /api/v1/chat/:id - Get conversation history
chatRouter.get('/:id', chatController.getConversation);
