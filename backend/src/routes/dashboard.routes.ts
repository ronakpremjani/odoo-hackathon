import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

router.use(protect);
router.use(authorize('Admin', 'Fleet Manager', 'Safety Officer', 'Financial Analyst'));

router.get('/kpis', DashboardController.getKpis);
router.get('/analytics', DashboardController.getAnalytics);

export default router;
