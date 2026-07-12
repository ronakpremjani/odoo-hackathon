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

// All user routes are protected and restricted to Admin
router.use(protect);
router.use(authorize('Admin'));

router.get('/', userController.getAll);
router.get('/:id', validateMongoId, validateRequest, userController.getById);
router.post('/', createUserValidator, validateRequest, userController.create);
router.put('/:id', validateMongoId, updateUserValidator, validateRequest, userController.update);
router.delete('/:id', validateMongoId, validateRequest, userController.delete);

export default router;
