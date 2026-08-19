import { Response } from 'express';

export function sendSuccess<T>(
  res: Response,
  data?: T,
  message: string = 'Success',
  statusCode: number = 200,
  meta?: any
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta,
  });
}

export function sendError(
  res: Response,
  message: string = 'An error occurred',
  statusCode: number = 500,
  errors?: string[]
) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: errors || [message],
  });
}
