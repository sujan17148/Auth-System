export enum ErrorCode {
  ERROR = 'ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',

  NOT_FOUND = 'NOT_FOUND',
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  UNPROCESSABLE_ENTITY = 'UNPROCESSABLE_ENTITY',
  CONFLICT = 'CONFLICT',

  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  SESSION_REVOKED = 'SESSION_REVOKED',
}

export class ApiError extends Error {
  statusCode: number;
  status: string;
  code: ErrorCode;
  isOperational: boolean;

  constructor(message: string, statusCode = 500, code: ErrorCode = ErrorCode.ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Not found') {
    super(message, 404, ErrorCode.NOT_FOUND);
  }
}

export class BadRequestError extends ApiError {
  constructor(message = 'Bad request') {
    super(message, 400, ErrorCode.BAD_REQUEST);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized request', code = ErrorCode.UNAUTHORIZED) {
    super(message, 401, code);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(message, 403, ErrorCode.FORBIDDEN);
  }
}

export class UnprocessableError extends ApiError {
  constructor(message = 'Unprocessable Entity') {
    super(message, 422, ErrorCode.UNPROCESSABLE_ENTITY);
  }
}

export class ConflictError extends ApiError {
  constructor(message = 'Resource already exists') {
    super(message, 409, ErrorCode.CONFLICT);
  }
}
