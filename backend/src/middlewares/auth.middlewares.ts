import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utility/apiError.js';
import { authService } from '../auth/services/auth.service.js';
import { config } from '../config/config.js';
import type { TokenPayload } from '../auth/types/auth.types.js';
import type { Role } from '../generated/prisma/enums.js';
import { asyncHandler } from '../utility/asyncHandler.js';
import type { AuthRequest } from '../types/express.js';

export const verifyJWT = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('authorization')?.split(' ')[1];
  if (!token) throw new UnauthorizedError();

  const decodedToken = jwt.verify(token, config.accessTokenKey) as TokenPayload;
  const user = await authService.getUserById(decodedToken.id);
  if (!user) throw new UnauthorizedError('Invalid or expired access token');

  if (!user.isActive) {
    throw new ForbiddenError('Account has been deactivated.');
  }

  req.user = user;
  next();
});

export const authorize =
  (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError();
    }

    next();
  };

export const requireVerifiedEmail = () => (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = req?.user;
  if (!user) {
    throw new UnauthorizedError();
  }

  if (!user.emailVerified) {
    throw new ForbiddenError('Please verify your email first');
  }

  next();
};
