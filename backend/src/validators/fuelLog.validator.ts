import { body } from 'express-validator';

export const createFuelLogValidator = [
  body('vehicle')
    .isMongoId()
    .withMessage('Vehicle ID is invalid'),
  body('driver')
    .isMongoId()
    .withMessage('Driver ID is invalid'),
  body('trip')
    .optional()
    .isMongoId(),
  body('date')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Invalid log date'),
  body('quantity')
    .isFloat({ min: 0.1 })
    .withMessage('Quantity must be greater than 0'),
  body('cost')
    .isFloat({ min: 0 })
    .withMessage('Cost cannot be negative'),
  body('odometer')
    .isFloat({ min: 0 })
    .withMessage('Odometer cannot be negative'),
  body('fuelStation')
    .optional()
    .trim(),
  body('receiptUrl')
    .optional()
    .trim()
];

export const updateFuelLogValidator = [
  body('vehicle')
    .optional()
    .isMongoId(),
  body('driver')
    .optional()
    .isMongoId(),
  body('trip')
    .optional()
    .isMongoId(),
  body('date')
    .optional()
    .isISO8601()
    .toDate(),
  body('quantity')
    .optional()
    .isFloat({ min: 0.1 }),
  body('cost')
    .optional()
    .isFloat({ min: 0 }),
  body('odometer')
    .optional()
    .isFloat({ min: 0 }),
  body('fuelStation')
    .optional()
    .trim(),
  body('receiptUrl')
    .optional()
    .trim()
];
