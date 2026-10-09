import { Router } from 'express';
import { ApiError } from '../errors.js';
import { createGroqChatCompletion } from '../services/groqService.js';
import type { ClientChatMessage } from '../types/ai.js';

const aiRouter = Router();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const parseRequest = (body: unknown): {
  messages: ClientChatMessage[];
  contextInfo?: string;
} => {
  if (!isRecord(body) || !Array.isArray(body.messages)) {
    throw new ApiError(
      400,
      'Request body must include a messages array.',
      'INVALID_AI_REQUEST'
    );
  }

  if (body.messages.length === 0 || body.messages.length > 50) {
    throw new ApiError(
      400,
      'Messages must contain between 1 and 50 items.',
      'INVALID_AI_REQUEST'
    );
  }

  const messages = body.messages.map((message): ClientChatMessage => {
    if (
      !isRecord(message) ||
      (message.sender !== 'user' && message.sender !== 'ai') ||
      typeof message.text !== 'string'
    ) {
      throw new ApiError(
        400,
        'Each message must include a valid sender and text.',
        'INVALID_AI_REQUEST'
      );
    }

    const text = message.text.trim();
    if (!text || text.length > 12_000) {
      throw new ApiError(
        400,
        'Each message must contain between 1 and 12,000 characters.',
        'INVALID_AI_REQUEST'
      );
    }

    return { sender: message.sender, text };
  });

  let contextInfo: string | undefined;
  if (body.contextInfo !== undefined) {
    if (typeof body.contextInfo !== 'string' || body.contextInfo.length > 12_000) {
      throw new ApiError(
        400,
        'contextInfo must be a string of at most 12,000 characters.',
        'INVALID_AI_REQUEST'
      );
    }
    contextInfo = body.contextInfo.trim();
  }

  return { messages, contextInfo };
};

aiRouter.post('/chat', async (req, res, next) => {
  try {
    const { messages, contextInfo } = parseRequest(req.body);
    const result = await createGroqChatCompletion(messages, contextInfo);
    res.json({ text: result.text, modelUsed: result.modelUsed });
  } catch (error) {
    next(error);
  }
});

export default aiRouter;
