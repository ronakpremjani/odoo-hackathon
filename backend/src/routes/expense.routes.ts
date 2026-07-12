import { Router } from 'express';
import { ExpenseController } from '../controllers/expense.controller';
import { createExpenseValidator, updateExpenseValidator } from '../validators/expense.validator';
import { validateMongoId } from '../validators/user.validator';
import { validateRequest } from '../middleware/validate';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();
const expenseController = new ExpenseController();

router.use(protect);

// Read permissions
router.get('/', authorize('Admin', 'Fleet Manager', 'Financial Analyst', 'Driver'), expenseController.getAll);
router.get('/:id', authorize('Admin', 'Fleet Manager', 'Financial Analyst', 'Driver'), validateMongoId, validateRequest, expenseController.getById);

// Create permissions (Admin, Fleet Manager, Financial Analyst, Driver)
router.post('/', authorize('Admin', 'Fleet Manager', 'Financial Analyst', 'Driver'), createExpenseValidator, validateRequest, expenseController.create);

// Update/Delete permissions (Restricted to Admin & Financial Analyst)
router.put('/:id', authorize('Admin', 'Financial Analyst'), validateMongoId, updateExpenseValidator, validateRequest, expenseController.update);
router.delete('/:id', authorize('Admin', 'Financial Analyst'), validateMongoId, validateRequest, expenseController.delete);

export default router;
