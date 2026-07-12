import { Router } from 'express';
import { MaintenanceController } from '../controllers/maintenance.controller';
import { createMaintenanceValidator, updateMaintenanceValidator } from '../validators/maintenance.validator';
import { validateMongoId } from '../validators/user.validator';
import { validateRequest } from '../middleware/validate';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();
const maintenanceController = new MaintenanceController();

router.use(protect);

// Read permissions
router.get('/', authorize('Admin', 'Fleet Manager', 'Safety Officer', 'Financial Analyst'), maintenanceController.getAll);
router.get('/:id', authorize('Admin', 'Fleet Manager', 'Safety Officer', 'Financial Analyst'), validateMongoId, validateRequest, maintenanceController.getById);

// Write permissions (Admin & Fleet Manager)
router.post('/', authorize('Admin', 'Fleet Manager'), createMaintenanceValidator, validateRequest, maintenanceController.create);
router.put('/:id', authorize('Admin', 'Fleet Manager'), validateMongoId, updateMaintenanceValidator, validateRequest, maintenanceController.update);
router.delete('/:id', authorize('Admin', 'Fleet Manager'), validateMongoId, validateRequest, maintenanceController.delete);

export default router;
