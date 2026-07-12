import { Router } from 'express';
import { DriverController } from '../controllers/driver.controller';
import { createDriverValidator, updateDriverValidator } from '../validators/driver.validator';
import { validateMongoId } from '../validators/user.validator';
import { validateRequest } from '../middleware/validate';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();
const driverController = new DriverController();

router.use(protect);

// Read permissions
router.get('/', authorize('Admin', 'Fleet Manager', 'Safety Officer', 'Financial Analyst'), driverController.getAll);
router.get('/:id', authorize('Admin', 'Fleet Manager', 'Safety Officer', 'Financial Analyst'), validateMongoId, validateRequest, driverController.getById);

// Write permissions (Admin & Fleet Manager)
router.post('/', authorize('Admin', 'Fleet Manager'), createDriverValidator, validateRequest, driverController.create);
router.put('/:id', authorize('Admin', 'Fleet Manager'), validateMongoId, updateDriverValidator, validateRequest, driverController.update);
router.delete('/:id', authorize('Admin', 'Fleet Manager'), validateMongoId, validateRequest, driverController.delete);

export default router;
