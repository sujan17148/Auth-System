import type { NextFunction, Request, Response } from 'express';
import type { ApiError } from './apiError.js';

export const errorHandler = (err: ApiError, req: Request, res: Response, next: NextFunction) => {
  console.error('🔥 ERROR:', err);

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
  });
};
