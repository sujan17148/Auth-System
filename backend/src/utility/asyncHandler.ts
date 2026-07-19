import type { NextFunction, Request, RequestHandler, Response } from 'express';

// export const asyncHandler =
//   (fn: Function): RequestHandler =>
//   (req: Request, res: Response, next: NextFunction) =>
//     Promise.resolve(fn(req, res, next)).catch(next);

export const asyncHandler =
  <T extends Request>(
    fn: (req: T, res: Response, next: NextFunction) => Promise<any>,
  ): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(fn(req as T, res, next)).catch(next);
