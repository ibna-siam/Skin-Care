import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../utils/response.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('[Error Handler]', err);

  if (err instanceof ZodError) {
    const errorMessages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    return sendError(res, 'Validation failed', 400, errorMessages);
  }

  if (err.name === 'UnauthorizedError') {
    return sendError(res, 'Invalid authorization credentials', 401);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  return sendError(res, message, statusCode);
}
