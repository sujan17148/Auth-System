import type { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../utility/asyncHandler.js';
import type { SlidingWindowConfig, TokenBucketConfig } from '../rate-limiting/types.js';
import { slidingWindowCounter } from '../rate-limiting/sliding-window.js';
import { ApiError, TooManyRequestsError, UnauthorizedError } from '../utility/apiError.js';
import { tokenBucketRateLimiter } from '../rate-limiting/token-bucket.js';
import type { AuthRequest } from '../types/express.js';

export function createRateLimitKey(limiter: string, identifier: string): string {
  return `rate-limit:${limiter}:${identifier}`;
}

export function createIpRateLimiter(name: string, config: SlidingWindowConfig) {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip;

    if (!ip) {
      throw new ApiError('Unable to determine client IP');
    }

    const key = createRateLimitKey(name, ip);

    const result = await slidingWindowCounter(key, config);

    if (!result.allowed) {
      throw new TooManyRequestsError();
    }

    next();
  });
}

export function createUserRateLimiter(name: string, config: TokenBucketConfig) {
  return asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user.id;

    if (!userId) {
      throw new UnauthorizedError('Authentication required');
    }

    const key = createRateLimitKey(name, userId);

    const result = await tokenBucketRateLimiter(key, config);

    if (!result.allowed) {
      throw new TooManyRequestsError();
    }

    next();
  });
}

export const globalRateLimiter = createIpRateLimiter('global', {
  windowSeconds: 60,
  maxRequests: 40,
});

export const loginRateLimiter = createIpRateLimiter('login', {
  windowSeconds: 60,
  maxRequests: 5,
});

export const passwordResetRateLimiter = createIpRateLimiter('password-reset', {
  windowSeconds: 24 * 60 * 60,
  maxRequests: 3,
});

export const passwordChangeAttemptRateLimiter = createIpRateLimiter('password-change-attempt', {
  windowSeconds: 15 * 60,
  maxRequests: 10,
});

export const authenticatedRateLimiter = createUserRateLimiter('authenticated', {
  maxTokens: 20,
  refillRate: 20 / 60,
});
