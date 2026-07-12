import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import {
  loginValidator,
  registerValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from '../validators/auth.validator';
import { validateRequest } from '../middleware/validate';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/register', registerValidator, validateRequest, AuthController.register);
router.post('/login', loginValidator, validateRequest, AuthController.login);
router.post('/forgot-password', forgotPasswordValidator, validateRequest, AuthController.forgotPassword);
router.post('/reset-password', resetPasswordValidator, validateRequest, AuthController.resetPassword);
router.post('/refresh', AuthController.refresh);

// Protected routes
router.post('/logout', protect, AuthController.logout);
router.get('/profile', protect, AuthController.getProfile);

export default router;
