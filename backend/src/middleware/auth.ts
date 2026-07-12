import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/appError';
import { JwtPayload } from '../types';

export const protect = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // 1. Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // 2. Fallback to reading from signed cookie
    else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(AppError.unauthorized('Authentication token missing. Please log in.'));
    }

    // Verify token
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_for_development_purposes';
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    // Attach decoded user payload to request
    req.user = decoded;
    next();
  } catch (error) {
    next(AppError.unauthorized('Invalid or expired authentication token. Please log in again.'));
  }
};
