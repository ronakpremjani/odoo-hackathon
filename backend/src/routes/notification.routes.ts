import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { createNotificationValidator, updateNotificationValidator } from '../validators/notification.validator';
import { validateMongoId } from '../validators/user.validator';
import { validateRequest } from '../middleware/validate';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();
const notificationController = new NotificationController();

router.use(protect);

// Standard read/write routes (recipients see their own list)
router.get('/', notificationController.getAll);
router.post('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', validateMongoId, validateRequest, notificationController.markAsRead);

// CRUD (System alerts can be generated/removed by Admin/Managers)
router.post('/', authorize('Admin', 'Fleet Manager', 'Safety Officer'), createNotificationValidator, validateRequest, notificationController.create);
router.put('/:id', authorize('Admin'), validateMongoId, updateNotificationValidator, validateRequest, notificationController.update);
router.delete('/:id', authorize('Admin'), validateMongoId, validateRequest, notificationController.delete);

export default router;
