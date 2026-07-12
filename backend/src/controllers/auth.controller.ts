import { Request, Response, NextFunction } from 'express';
import { ResponseHandler } from '../utils/responseHandler';

export class AuthController {
  static login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Placeholder data structure to verify architecture flows
      const mockUser = {
        id: 'mock-user-uuid',
        name: 'TransitOps Admin',
        email: req.body.email || 'admin@transitops.com',
        role: 'Admin'
      };

      const mockTokens = {
        accessToken: 'mock-jwt-access-token-string',
        refreshToken: 'mock-jwt-refresh-token-string'
      };

      // Set cookie in browser
      res.cookie('accessToken', mockTokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 mins
      });

      ResponseHandler.success(
        res,
        { user: mockUser, token: mockTokens.accessToken },
        'Authentication successful'
      );
    } catch (error) {
      next(error);
    }
  };

  static refresh = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      ResponseHandler.success(
        res,
        { token: 'new-mock-jwt-access-token-string' },
        'Token refreshed successfully'
      );
    } catch (error) {
      next(error);
    }
  };

  static logout = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.clearCookie('accessToken');
      ResponseHandler.success(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  };
}
