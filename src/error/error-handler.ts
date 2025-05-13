import { Response } from 'express';
import { AuthError } from './auth-error';
import httpStatus from 'http-status';

interface ErrorResponse {
  message: string;
  code?: string;
  details?: any;
}

const handleErrorResponse = (res: Response, err: any): void => {
  console.error('Error:', err);

  let response: ErrorResponse = {
    message: 'Internal Server Error',
  };

  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;

  // Handle known error types
  if (err instanceof AuthError) {
    statusCode = err.statusCode;
    response.message = err.message;
  }
  // Handle Mongoose/MongoDB errors
  else if (err.name === 'ValidationError') {
    statusCode = httpStatus.BAD_REQUEST;
    response.message = 'Validation Error';
    response.details = Object.values(err.errors).map((error: any) => error.message);
  } else if (err.name === 'MongoError' && err.code === 11000) {
    statusCode = httpStatus.CONFLICT;
    response.message = 'Duplicate Entry';
    response.code = 'DUPLICATE_ERROR';
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = httpStatus.UNAUTHORIZED;
    response.message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = httpStatus.UNAUTHORIZED;
    response.message = 'Token expired';
  }

  // In development, include error details
  if (process.env.NODE_ENV === 'development') {
    response.details = {
      stack: err.stack,
      ...(err.details && { additionalDetails: err.details }),
    };
  }

  res.status(statusCode).json(response);
};

export default handleErrorResponse;
