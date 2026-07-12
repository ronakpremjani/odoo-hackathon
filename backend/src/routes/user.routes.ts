import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import {
  createUserValidator,
  updateUserValidator,
  validateMongoId,
} from '../validators/user.validator';
import { validateRequest } from '../middleware/validate';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();
const userController = new UserController();

// All user routes are protected
router.use(protect);

router.get('/', authorize('Admin', 'Fleet Manager'), userController.getAll);
router.get('/:id', authorize('Admin', 'Fleet Manager'), validateMongoId, validateRequest, userController.getById);
router.post('/', authorize('Admin'), createUserValidator, validateRequest, userController.create);
router.put('/:id', authorize('Admin'), validateMongoId, updateUserValidator, validateRequest, userController.update);
router.delete('/:id', authorize('Admin'), validateMongoId, validateRequest, userController.delete);

export default router;
