import { body } from 'express-validator';
import { TripStatus } from '../models/trip.model';

export const createTripValidator = [
  body('tripId')
    .trim()
    .notEmpty()
    .withMessage('Trip ID is required')
    .toUpperCase(),
  body('vehicle')
    .isMongoId()
    .withMessage('Vehicle ID is invalid'),
  body('driver')
    .isMongoId()
    .withMessage('Driver ID is invalid'),
  body('startLocation')
    .isObject()
    .withMessage('Start location is required'),
  body('startLocation.name')
    .trim()
    .notEmpty()
    .withMessage('Start location name is required'),
  body('startLocation.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array of [lng, lat]'),
  body('endLocation')
    .isObject()
    .withMessage('End location is required'),
  body('endLocation.name')
    .trim()
    .notEmpty()
    .withMessage('End location name is required'),
  body('endLocation.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array of [lng, lat]'),
  body('status')
    .optional()
    .isIn(Object.values(TripStatus))
    .withMessage('Invalid trip status'),
  body('startOdometer')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Start odometer must be positive'),
  body('endOdometer')
    .optional()
    .isFloat({ min: 0 }),
  body('estimatedStartTime')
    .isISO8601()
    .toDate()
    .withMessage('Estimated start time is required'),
  body('estimatedEndTime')
    .isISO8601()
    .toDate()
    .withMessage('Estimated end time is required'),
  body('cargoDetails')
    .optional()
    .isObject(),
  body('cargoDetails.description')
    .optional()
    .trim(),
  body('cargoDetails.weight')
    .optional()
    .isFloat({ min: 0 })
];

export const updateTripValidator = [
  body('tripId')
    .optional()
    .trim()
    .notEmpty()
    .toUpperCase(),
  body('vehicle')
    .optional()
    .isMongoId(),
  body('driver')
    .optional()
    .isMongoId(),
  body('startLocation')
    .optional()
    .isObject(),
  body('startLocation.name')
    .optional()
    .trim()
    .notEmpty(),
  body('endLocation')
    .optional()
    .isObject(),
  body('endLocation.name')
    .optional()
    .trim()
    .notEmpty(),
  body('status')
    .optional()
    .isIn(Object.values(TripStatus)),
  body('startOdometer')
    .optional()
    .isFloat({ min: 0 }),
  body('endOdometer')
    .optional()
    .isFloat({ min: 0 }),
  body('estimatedStartTime')
    .optional()
    .isISO8601()
    .toDate(),
  body('estimatedEndTime')
    .optional()
    .isISO8601()
    .toDate(),
  body('cargoDetails')
    .optional()
    .isObject()
];
