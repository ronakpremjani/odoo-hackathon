import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized('User not authenticated'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        AppError.forbidden(
          `Access denied. Required roles: [${allowedRoles.join(', ')}]. Your role: ${req.user.role}`
        )
      );
    }

    next();
  };
};
