import { Router } from 'express';
import { ResponseHandler } from '../utils/responseHandler';
import authRouter from './auth.routes';
import userRouter from './user.routes';
import vehicleRouter from './vehicle.routes';
import driverRouter from './driver.routes';
import tripRouter from './trip.routes';
import fuelLogRouter from './fuelLog.routes';
import expenseRouter from './expense.routes';
import maintenanceRouter from './maintenance.routes';
import notificationRouter from './notification.routes';
import dashboardRouter from './dashboard.routes';

const router = Router();

// Base api endpoint
router.get('/', (_req, res) => {
  ResponseHandler.success(res, { version: '1.0.0' }, 'TransitOps API Engine V1 is operational');
});

// Register routes
router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/vehicles', vehicleRouter);
router.use('/drivers', driverRouter);
router.use('/trips', tripRouter);
router.use('/fuel-logs', fuelLogRouter);
router.use('/expenses', expenseRouter);
router.use('/maintenances', maintenanceRouter);
router.use('/notifications', notificationRouter);
router.use('/dashboard', dashboardRouter);

export default router;
