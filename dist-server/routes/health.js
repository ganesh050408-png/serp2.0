import { Router } from 'express';
import { createGroqChatCompletion } from '../services/groqService.js';
const healthRouter = Router();
healthRouter.get('/', (_req, res) => {
    res.json({ status: 'ok' });
});
healthRouter.get('/llm', async (req, res) => {
    const secret = process.env.HEALTH_CHECK_SECRET;
    if (process.env.NODE_ENV === 'production' && secret) {
        const provided = req.headers['x-health-secret'] || req.query.secret;
        if (provided !== secret) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized health check request' });
        }
    }
    try {
        const result = await createGroqChatCompletion([
            { sender: 'user', text: 'ping' }
        ]);
        return res.json({
            status: 'ok',
            provider: 'groq',
            modelUsed: result.modelUsed,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        return res.status(502).json({
            status: 'error',
            message: error?.message || 'LLM health check failed',
            timestamp: new Date().toISOString(),
        });
    }
});
export default healthRouter;
//# sourceMappingURL=health.js.map