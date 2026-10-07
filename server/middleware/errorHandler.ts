import type { ErrorRequestHandler } from 'express';
import { ApiError } from '../errors.js';

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      error: error.message,
      code: error.code,
    });
    return;
  }

  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({
      error: 'Request body must contain valid JSON.',
      code: 'INVALID_JSON',
    });
    return;
  }

  console.error('Unhandled API error.', {
    method: req.method,
    path: req.path,
    name: error instanceof Error ? error.name : 'UnknownError',
  });

  res.status(500).json({
    error: 'Internal server error.',
    code: 'INTERNAL_ERROR',
  });
};
