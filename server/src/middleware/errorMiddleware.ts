import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import { ERROR_MESSAGES } from 'shared';

export interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Not Found middleware
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new CustomError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

// Global error handler middleware
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error details
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // MongoDB CastError (Invalid ObjectId)
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new CustomError(message, 404);
  }

  // MongoDB Duplicate Key Error
  if (err.name === 'MongoServerError' && 'code' in err && err.code === 11000) {
    const duplicateField = Object.keys((err as any).keyValue)[0];
    const message = `${duplicateField} already exists`;
    error = new CustomError(message, 400);
  }

  // MongoDB Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values((err as any).errors).map((val: any) => val.message);
    const message = `Validation Error: ${errors.join(', ')}`;
    error = new CustomError(message, 400);
  }

  // JWT Error
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new CustomError(message, 401);
  }

  // JWT Expired
  if (err.name === 'TokenExpiredError') {
    const message = ERROR_MESSAGES.TOKEN_EXPIRED;
    error = new CustomError(message, 401);
  }

  // Multer Error (File Upload)
  if (err.name === 'MulterError') {
    let message = 'File upload error';
    if ((err as any).code === 'LIMIT_FILE_SIZE') {
      message = ERROR_MESSAGES.FILE_TOO_LARGE;
    } else if ((err as any).code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Too many files uploaded';
    }
    error = new CustomError(message, 400);
  }

  // Zod Validation Error
  if (err.name === 'ZodError') {
    const errors = (err as any).errors.map((error: any) => 
      `${error.path.join('.')}: ${error.message}`
    );
    const message = `Validation Error: ${errors.join(', ')}`;
    error = new CustomError(message, 400);
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = error.message || ERROR_MESSAGES.SERVER_ERROR;

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      details: error
    })
  });
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Create specific error types
export const createError = (message: string, statusCode: number) => {
  return new CustomError(message, statusCode);
};

export const badRequestError = (message: string = 'Bad Request') => {
  return new CustomError(message, 400);
};

export const unauthorizedError = (message: string = ERROR_MESSAGES.UNAUTHORIZED) => {
  return new CustomError(message, 401);
};

export const forbiddenError = (message: string = ERROR_MESSAGES.FORBIDDEN) => {
  return new CustomError(message, 403);
};

export const notFoundError = (message: string = ERROR_MESSAGES.NOT_FOUND) => {
  return new CustomError(message, 404);
};

export const conflictError = (message: string = 'Conflict') => {
  return new CustomError(message, 409);
};

export const validationError = (message: string = ERROR_MESSAGES.VALIDATION_ERROR) => {
  return new CustomError(message, 422);
};

export const serverError = (message: string = ERROR_MESSAGES.SERVER_ERROR) => {
  return new CustomError(message, 500);
};