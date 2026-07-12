import { Router } from 'express';
import { TripController } from '../controllers/trip.controller';
import { createTripValidator, updateTripValidator } from '../validators/trip.validator';
import { validateMongoId } from '../validators/user.validator';
import { validateRequest } from '../middleware/validate';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();
const tripController = new TripController();

router.use(protect);

// Read permissions
router.get('/', authorize('Admin', 'Fleet Manager', 'Safety Officer', 'Driver'), tripController.getAll);
router.get('/:id', authorize('Admin', 'Fleet Manager', 'Safety Officer', 'Driver'), validateMongoId, validateRequest, tripController.getById);

// Write permissions
router.post('/', authorize('Admin', 'Fleet Manager'), createTripValidator, validateRequest, tripController.create);
router.put('/:id', authorize('Admin', 'Fleet Manager', 'Driver'), validateMongoId, updateTripValidator, validateRequest, tripController.update);
router.delete('/:id', authorize('Admin', 'Fleet Manager'), validateMongoId, validateRequest, tripController.delete);

export default router;
