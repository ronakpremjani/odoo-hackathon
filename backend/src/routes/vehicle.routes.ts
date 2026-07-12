import { Router } from 'express';
import { VehicleController } from '../controllers/vehicle.controller';
import { createVehicleValidator, updateVehicleValidator } from '../validators/vehicle.validator';
import { validateMongoId } from '../validators/user.validator';
import { validateRequest } from '../middleware/validate';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();
const vehicleController = new VehicleController();

router.use(protect);

// Read permissions
router.get('/', authorize('Admin', 'Fleet Manager', 'Safety Officer', 'Financial Analyst'), vehicleController.getAll);
router.get('/:id/metrics', authorize('Admin', 'Fleet Manager', 'Safety Officer', 'Financial Analyst'), validateMongoId, validateRequest, vehicleController.getVehicleMetrics);
router.get('/:id', authorize('Admin', 'Fleet Manager', 'Safety Officer', 'Financial Analyst'), validateMongoId, validateRequest, vehicleController.getById);

// Write permissions (Admin & Fleet Manager)
router.post('/', authorize('Admin', 'Fleet Manager'), createVehicleValidator, validateRequest, vehicleController.create);
router.put('/:id', authorize('Admin', 'Fleet Manager'), validateMongoId, updateVehicleValidator, validateRequest, vehicleController.update);
router.delete('/:id', authorize('Admin', 'Fleet Manager'), validateMongoId, validateRequest, vehicleController.delete);

export default router;
