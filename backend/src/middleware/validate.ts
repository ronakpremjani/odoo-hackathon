import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '../utils/appError';

export const validateRequest = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => {
      // Handle different validation types from express-validator
      if (err.type === 'field') {
        return {
          field: err.path,
          message: err.msg
        };
      }
      return {
        field: 'unknown',
        message: err.msg
      };
    });

    return next(AppError.badRequest('Input validation failed', formattedErrors));
  }
  next();
};
