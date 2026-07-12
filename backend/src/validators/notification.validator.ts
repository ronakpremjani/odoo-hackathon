import { body } from 'express-validator';
import { NotificationType, NotificationPriority, NotificationStatus } from '../models/notification.model';

export const createNotificationValidator = [
  body('recipient')
    .isMongoId()
    .withMessage('Recipient must be a valid User ID'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required'),
  body('type')
    .optional()
    .isIn(Object.values(NotificationType)),
  body('priority')
    .optional()
    .isIn(Object.values(NotificationPriority)),
  body('status')
    .optional()
    .isIn(Object.values(NotificationStatus)),
  body('link')
    .optional()
    .trim()
];

export const updateNotificationValidator = [
  body('recipient')
    .optional()
    .isMongoId(),
  body('title')
    .optional()
    .trim()
    .notEmpty(),
  body('message')
    .optional()
    .trim()
    .notEmpty(),
  body('type')
    .optional()
    .isIn(Object.values(NotificationType)),
  body('priority')
    .optional()
    .isIn(Object.values(NotificationPriority)),
  body('status')
    .optional()
    .isIn(Object.values(NotificationStatus)),
  body('link')
    .optional()
    .trim()
];
