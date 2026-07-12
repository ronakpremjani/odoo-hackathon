import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ResponseHandler } from '../utils/responseHandler';

export class AuthController {
  private static readonly authService = new AuthService();

  static register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await AuthController.authService.register(req.body);

      // Set cookie in browser
      res.cookie('accessToken', result.tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 mins
      });

      ResponseHandler.success(
        res,
        result,
        'Registration successful',
        201
      );
    } catch (error) {
      next(error);
    }
  };

  static login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const result = await AuthController.authService.login(email, password);

      // Set cookie in browser
      res.cookie('accessToken', result.tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 mins
      });

      ResponseHandler.success(
        res,
        result,
        'Authentication successful'
      );
    } catch (error) {
      next(error);
    }
  };

  static refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.cookies.refreshToken || req.body.refreshToken;
      const result = await AuthController.authService.refresh(token);

      // Set cookie in browser
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 mins
      });

      ResponseHandler.success(
        res,
        result,
        'Token refreshed successfully'
      );
    } catch (error) {
      next(error);
    }
  };

  static logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.id) {
        await AuthController.authService.logout(req.user.id);
      }
      res.clearCookie('accessToken');
      ResponseHandler.success(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  };

  static forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await AuthController.authService.forgotPassword(req.body.email);
      ResponseHandler.success(res, result, 'Reset link generated successfully (Logged to console)');
    } catch (error) {
      next(error);
    }
  };

  static resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, newPassword } = req.body;
      await AuthController.authService.resetPassword(token, newPassword);
      ResponseHandler.success(res, null, 'Password reset successful');
    } catch (error) {
      next(error);
    }
  };

  static getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const profile = await AuthController.authService.getProfile(userId!);
      ResponseHandler.success(res, profile, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}
