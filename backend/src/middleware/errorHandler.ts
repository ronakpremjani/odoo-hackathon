import { Request, Response, NextFunction } from 'express';
import { ResponseHandler } from '../utils/responseHandler';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Log only in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error Stack:', err);
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors).map((e: any) => ({
      field: e.path,
      message: e.message
    }));
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for field ${err.path}`;
  }

  // Handle MongoDB duplicate key errors
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate key error. A resource with this value already exists.';
    errors = Object.keys(err.keyValue).map(key => ({
      field: key,
      message: `${key} must be unique`
    }));
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired. Please refresh your session.';
  }

  ResponseHandler.error(res, message, statusCode, errors);
};
