import type { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { SendMessageRequestSchema, createSuccessResponse } from '@scamshield/shared';
import { analysisService } from '../../services/analysis.js';
import { AppError } from '../../middleware/errorHandler.js';

// In-memory storage for conversations (replace with database in production)
const conversations = new Map<string, { messages: unknown[]; context?: unknown }>();

export const chatController = {
  /**
   * Send a chat message
   */
  async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = SendMessageRequestSchema.safeParse(req.body);

      if (!validation.success) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Invalid message', {
          errors: validation.error.errors,
        });
      }

      const { content, conversation_id, context } = validation.data;
      const conversationId = conversation_id || uuidv4();

      // Get or create conversation
      let conversation = conversations.get(conversationId);
      if (!conversation) {
        conversation = { messages: [], context };
        conversations.set(conversationId, conversation);
      }

      // Add user message
      const userMessage = {
        id: uuidv4(),
        role: 'user',
        content,
        timestamp: new Date(),
      };
      conversation.messages.push(userMessage);

      // Generate response
      let responseText: string;
      if (context) {
        responseText = await analysisService.askFollowUp(context as any, content);
      } else {
        responseText = 'I can help you analyze suspicious messages for potential scams. Please share a message you\'d like me to check, or upload a screenshot or audio file.';
      }

      // Add assistant message
      const assistantMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
      };
      conversation.messages.push(assistantMessage);

      res.json(createSuccessResponse({
        conversation_id: conversationId,
        message: assistantMessage,
      }));
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get conversation history
   */
  async getConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const conversation = conversations.get(id);

      if (!conversation) {
        throw new AppError(404, 'NOT_FOUND', 'Conversation not found');
      }

      res.json(createSuccessResponse(conversation.messages));
    } catch (error) {
      next(error);
    }
  },
};
