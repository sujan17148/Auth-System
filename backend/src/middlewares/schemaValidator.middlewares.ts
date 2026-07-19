import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { BadRequestError } from '../utility/apiError.js';

interface ValidateRequestPayload {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
}
export const validateSchema =
  ({ body, params, query }: ValidateRequestPayload) =>
  (req: Request, res: Response, next: NextFunction) => {
    const schemas = { body, params, query } as const;
    req.validated = {};

    for (const source of Object.keys(schemas) as Array<keyof typeof schemas>) {
      const schema = schemas[source];
      if (!schema) continue;

      const result = schema.safeParse(req[source]);
      if (!result.success) {
        const firstError = result.error.issues[0]?.message ?? 'Validation failed';
        return next(new BadRequestError(firstError));
      }

      req.validated[source] = result.data;
    }
    next();
  };
