import { body } from 'express-validator';
import { MaintenanceType, MaintenanceStatus, MaintenancePriority } from '../models/maintenance.model';

export const createMaintenanceValidator = [
  body('maintenanceId')
    .trim()
    .notEmpty()
    .withMessage('Maintenance ID is required')
    .toUpperCase(),
  body('vehicle')
    .isMongoId()
    .withMessage('Vehicle ID is invalid'),
  body('type')
    .isIn(Object.values(MaintenanceType))
    .withMessage('Invalid maintenance type'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('status')
    .optional()
    .isIn(Object.values(MaintenanceStatus)),
  body('priority')
    .optional()
    .isIn(Object.values(MaintenancePriority)),
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost cannot be negative'),
  body('scheduledDate')
    .isISO8601()
    .toDate()
    .withMessage('Scheduled date is required'),
  body('completedDate')
    .optional()
    .isISO8601()
    .toDate(),
  body('performedBy')
    .optional()
    .trim()
];

export const updateMaintenanceValidator = [
  body('maintenanceId')
    .optional()
    .trim()
    .notEmpty()
    .toUpperCase(),
  body('vehicle')
    .optional()
    .isMongoId(),
  body('type')
    .optional()
    .isIn(Object.values(MaintenanceType)),
  body('description')
    .optional()
    .trim()
    .notEmpty(),
  body('status')
    .optional()
    .isIn(Object.values(MaintenanceStatus)),
  body('priority')
    .optional()
    .isIn(Object.values(MaintenancePriority)),
  body('cost')
    .optional()
    .isFloat({ min: 0 }),
  body('scheduledDate')
    .optional()
    .isISO8601()
    .toDate(),
  body('completedDate')
    .optional()
    .isISO8601()
    .toDate(),
  body('performedBy')
    .optional()
    .trim()
];
