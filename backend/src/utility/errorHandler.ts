import type { NextFunction, Request, Response } from 'express';
import { ApiError, ErrorCode } from './apiError.js';

export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error('🔥 ERROR:', err);

  if (err instanceof ApiError && err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      code: err.code,
    });
  }

  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
    code: ErrorCode.INTERNAL_SERVER_ERROR,
  });
};
