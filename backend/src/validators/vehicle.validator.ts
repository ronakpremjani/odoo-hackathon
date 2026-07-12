import { body } from 'express-validator';
import { VehicleType, VehicleStatus, FuelType } from '../models/vehicle.model';

export const createVehicleValidator = [
  body('plateNumber')
    .trim()
    .notEmpty()
    .withMessage('Plate number is required')
    .toUpperCase(),
  body('make')
    .trim()
    .notEmpty()
    .withMessage('Make is required'),
  body('model')
    .trim()
    .notEmpty()
    .withMessage('Model is required'),
  body('year')
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Invalid manufacture year'),
  body('type')
    .isIn(Object.values(VehicleType))
    .withMessage('Invalid vehicle type'),
  body('status')
    .optional()
    .isIn(Object.values(VehicleStatus))
    .withMessage('Invalid vehicle status'),
  body('vin')
    .optional()
    .trim()
    .toUpperCase(),
  body('mileage')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Mileage cannot be negative'),
  body('fuelType')
    .isIn(Object.values(FuelType))
    .withMessage('Invalid fuel type'),
  body('capacity')
    .optional()
    .isObject()
    .withMessage('Capacity must be an object'),
  body('capacity.payload')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Payload capacity must be positive'),
  body('capacity.volume')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Volume capacity must be positive')
];

export const updateVehicleValidator = [
  body('plateNumber')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Plate number cannot be empty')
    .toUpperCase(),
  body('make')
    .optional()
    .trim()
    .notEmpty(),
  body('model')
    .optional()
    .trim()
    .notEmpty(),
  body('year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
  body('type')
    .optional()
    .isIn(Object.values(VehicleType)),
  body('status')
    .optional()
    .isIn(Object.values(VehicleStatus)),
  body('vin')
    .optional()
    .trim()
    .toUpperCase(),
  body('mileage')
    .optional()
    .isFloat({ min: 0 }),
  body('fuelType')
    .optional()
    .isIn(Object.values(FuelType)),
  body('capacity')
    .optional()
    .isObject(),
  body('capacity.payload')
    .optional()
    .isFloat({ min: 0 }),
  body('capacity.volume')
    .optional()
    .isFloat({ min: 0 })
];
