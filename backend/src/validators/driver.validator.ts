import { body } from 'express-validator';
import { LicenseType, DriverStatus } from '../models/driver.model';

export const createDriverValidator = [
  body('user')
    .isMongoId()
    .withMessage('Must map to a valid User ID'),
  body('licenseNumber')
    .trim()
    .notEmpty()
    .withMessage('License number is required'),
  body('licenseType')
    .isIn(Object.values(LicenseType))
    .withMessage('Invalid license type'),
  body('licenseExpiry')
    .isISO8601()
    .toDate()
    .withMessage('Must be a valid expiry date'),
  body('status')
    .optional()
    .isIn(Object.values(DriverStatus))
    .withMessage('Invalid driver status'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  body('emergencyContact')
    .isObject()
    .withMessage('Emergency contact must be defined'),
  body('emergencyContact.name')
    .trim()
    .notEmpty()
    .withMessage('Emergency contact name is required'),
  body('emergencyContact.relationship')
    .trim()
    .notEmpty()
    .withMessage('Emergency contact relationship is required'),
  body('emergencyContact.phone')
    .trim()
    .notEmpty()
    .withMessage('Emergency contact phone is required'),
  body('currentVehicle')
    .optional()
    .isMongoId()
    .withMessage('Invalid current vehicle ID')
];

export const updateDriverValidator = [
  body('user')
    .optional()
    .isMongoId(),
  body('licenseNumber')
    .optional()
    .trim()
    .notEmpty(),
  body('licenseType')
    .optional()
    .isIn(Object.values(LicenseType)),
  body('licenseExpiry')
    .optional()
    .isISO8601()
    .toDate(),
  body('status')
    .optional()
    .isIn(Object.values(DriverStatus)),
  body('phone')
    .optional()
    .trim()
    .notEmpty(),
  body('emergencyContact')
    .optional()
    .isObject(),
  body('emergencyContact.name')
    .optional()
    .trim()
    .notEmpty(),
  body('emergencyContact.relationship')
    .optional()
    .trim()
    .notEmpty(),
  body('emergencyContact.phone')
    .optional()
    .trim()
    .notEmpty(),
  body('currentVehicle')
    .optional()
    .isMongoId()
];
