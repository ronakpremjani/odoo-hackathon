import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { loginValidator } from '../validators/auth.validator';
import { validateRequest } from '../middleware/validate';

const router = Router();

router.post('/login', loginValidator, validateRequest, AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);

export default router;
