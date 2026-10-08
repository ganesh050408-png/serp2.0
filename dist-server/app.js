import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import aiRouter from './routes/ai.js';
import destinationsRouter from './routes/destinations.js';
import healthRouter from './routes/health.js';
import hospitalsRouter from './routes/hospitals.js';
import placesRouter from './routes/places.js';
import photosRouter from './routes/photos.js';
import { errorHandler } from './middleware/errorHandler.js';
import { handleFlightSearchRequest } from './flightApiHandler.js';
const getPositiveInteger = (value, fallback) => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};
const allowedOrigins = (process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
const isAllowedOrigin = (origin) => {
    if (allowedOrigins.includes(origin))
        return true;
    try {
        const { hostname } = new URL(origin);
        if (hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname === '::1' ||
            hostname === '0.0.0.0' ||
            hostname.endsWith('.localhost') ||
            hostname.startsWith('192.168.') ||
            hostname.startsWith('10.') ||
            hostname.startsWith('172.')) {
            return true;
        }
    }
    catch {
        // If not a valid URL, rely on direct matching
    }
    return false;
};
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || isAllowedOrigin(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error(`Origin '${origin}' is not allowed by the API server.`));
    },
};
const rateLimitResponse = (_req, res) => {
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
    app.use('/api/destinations', destinationsRouter);
    app.use('/api/hospitals', hospitalsRouter);
    app.use('/api/places', placesRouter);
    app.use('/api/photos', photosRouter);
    app.get('/api/flights/search', async (req, res) => {
        await handleFlightSearchRequest(req, res);
    });
    app.use('/api', (_req, res) => {
        res.status(404).json({
            error: 'API route not found.',
            code: 'NOT_FOUND',
        });
    });
    app.use(errorHandler);
    return app;
};
//# sourceMappingURL=app.js.map