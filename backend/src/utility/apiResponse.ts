import type { Response } from 'express';

export interface ApiResponseType<T> {
  message: string;
  data?: T;
}

export interface ApiResponsePayload<T> {
  res: Response;
  statusCode: number;
  message: string;
  data?: T;
}

export const sendApiResponse = <T>({
  res,
  statusCode,
  message,
  data,
}: ApiResponsePayload<T>): Response<ApiResponseType<T>> => {
  return res.status(statusCode).json({
    message,
    ...(data !== undefined && { data }),
  } satisfies ApiResponseType<T>);
};
