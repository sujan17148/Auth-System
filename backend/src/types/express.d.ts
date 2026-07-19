import { Request } from 'express';
import type { SafeUserData } from '../auth/auth.types.ts';

interface Validated {
  body?: unknown;
  params?: unknown;
  query?: unknowns;
}

declare global {
  namespace Express {
    interface Request {
      user?: SafeUserData;
      cookies?: unknown;
      validated: Validated;
    }
  }
}

export interface AuthRequest extends Request {
  user: SafeUserData;
}

export type TypedRequest<Tbody = unknown, TParams = unknown, TQuery = unknown> = Request & {
  validated: {
    body: Tbody;
    params: TParams;
    query: TQuery;
  };
};

export type TypedAuthRequest<Tbody = unknown, TParams = unknown, TQuery = unknown> = AuthRequest & {
  validated: {
    body: Tbody;
    params: TParams;
    query: TQuery;
  };
};
