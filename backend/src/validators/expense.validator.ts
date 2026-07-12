import { body } from 'express-validator';
import { ExpenseCategory, ExpenseStatus } from '../models/expense.model';

export const createExpenseValidator = [
  body('expenseId')
    .trim()
    .notEmpty()
    .withMessage('Expense ID is required')
    .toUpperCase(),
  body('category')
    .isIn(Object.values(ExpenseCategory))
    .withMessage('Invalid expense category'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be positive'),
  body('date')
    .optional()
    .isISO8601()
    .toDate(),
  body('status')
    .optional()
    .isIn(Object.values(ExpenseStatus)),
  body('vehicle')
    .optional()
    .isMongoId(),
  body('driver')
    .optional()
    .isMongoId(),
  body('trip')
    .optional()
    .isMongoId(),
  body('maintenance')
    .optional()
    .isMongoId(),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('receiptUrl')
    .optional()
    .trim(),
  body('approvedBy')
    .optional()
    .isMongoId()
];

export const updateExpenseValidator = [
  body('expenseId')
    .optional()
    .trim()
    .notEmpty()
    .toUpperCase(),
  body('category')
    .optional()
    .isIn(Object.values(ExpenseCategory)),
  body('amount')
    .optional()
    .isFloat({ min: 0.01 }),
  body('date')
    .optional()
    .isISO8601()
    .toDate(),
  body('status')
    .optional()
    .isIn(Object.values(ExpenseStatus)),
  body('vehicle')
    .optional()
    .isMongoId(),
  body('driver')
    .optional()
    .isMongoId(),
  body('trip')
    .optional()
    .isMongoId(),
  body('maintenance')
    .optional()
    .isMongoId(),
  body('description')
    .optional()
    .trim()
    .notEmpty(),
  body('receiptUrl')
    .optional()
    .trim(),
  body('approvedBy')
    .optional()
    .isMongoId()
];
