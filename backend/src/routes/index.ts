import { Router } from 'express';
import { ResponseHandler } from '../utils/responseHandler';
import authRouter from './auth.routes';

const router = Router();

// Base api endpoint
router.get('/', (_req, res) => {
  ResponseHandler.success(res, { version: '1.0.0' }, 'TransitOps API Engine V1 is operational');
});

// Register routes
router.use('/auth', authRouter);

export default router;
