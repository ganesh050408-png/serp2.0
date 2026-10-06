import 'dotenv/config';
import cors, { type CorsOptions } from 'cors';
import express, { type RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import aiRouter from './routes/ai.js';
import healthRouter from './routes/health.js';
import { errorHandler } from './middleware/errorHandler.js';

const getPositiveInteger = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const allowedOrigins = (process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Origin is not allowed by the API server.'));
  },
};

const rateLimitResponse: RequestHandler = (_req, res) => {
  res.status(429).json({
    error: 'Too many requests. Please try again later.',
    code: 'RATE_LIMITED',
  });
};

const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: getPositiveInteger(process.env.API_RATE_LIMIT, 120),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: rateLimitResponse,
});

const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: getPositiveInteger(process.env.AI_RATE_LIMIT, 30),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: rateLimitResponse,
});

export const createApp = () => {
  const app = express();
  app.disable('x-powered-by');

  app.use(cors(corsOptions));
  app.use(express.json({ limit: '1mb' }));
  app.use('/api', apiRateLimiter);

  app.use('/api/health', healthRouter);
  app.use('/api/ai', aiRateLimiter, aiRouter);

  app.use('/api', (_req, res) => {
    res.status(404).json({
      error: 'API route not found.',
      code: 'NOT_FOUND',
    });
  });

  app.use(errorHandler);
  return app;
};
