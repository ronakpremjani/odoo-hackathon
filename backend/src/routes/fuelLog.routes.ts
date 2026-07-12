import { Router } from 'express';
import { FuelLogController } from '../controllers/fuelLog.controller';
import { createFuelLogValidator, updateFuelLogValidator } from '../validators/fuelLog.validator';
import { validateMongoId } from '../validators/user.validator';
import { validateRequest } from '../middleware/validate';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();
const fuelLogController = new FuelLogController();

router.use(protect);

// Read permissions
router.get('/', authorize('Admin', 'Fleet Manager', 'Financial Analyst', 'Driver'), fuelLogController.getAll);
router.get('/:id', authorize('Admin', 'Fleet Manager', 'Financial Analyst', 'Driver'), validateMongoId, validateRequest, fuelLogController.getById);

// Write permissions (Admin, Fleet Manager, and Driver can create)
router.post('/', authorize('Admin', 'Fleet Manager', 'Driver'), createFuelLogValidator, validateRequest, fuelLogController.create);
router.put('/:id', authorize('Admin', 'Fleet Manager'), validateMongoId, updateFuelLogValidator, validateRequest, fuelLogController.update);
router.delete('/:id', authorize('Admin', 'Fleet Manager'), validateMongoId, validateRequest, fuelLogController.delete);

export default router;
