import { Router } from 'express';
import { ApiError } from '../errors.js';
import { searchSerpApiDestinations } from '../services/serpApiService.js';

const destinationsRouter = Router();

destinationsRouter.get('/autocomplete', async (req, res, next) => {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';

  if (typeof req.query.q !== 'undefined' && typeof req.query.q !== 'string') {
    next(new ApiError(400, 'The q query parameter must be a string.', 'INVALID_DESTINATION_QUERY'));
    return;
  }

  if (query.length < 3) {
    res.json({ results: [] });
    return;
  }

  if (query.length > 100) {
    next(new ApiError(400, 'The destination query is too long.', 'INVALID_DESTINATION_QUERY'));
    return;
  }

  try {
    const results = await searchSerpApiDestinations(query);
    res.json({ results });
  } catch (error) {
    next(error);
  }
});

export default destinationsRouter;
