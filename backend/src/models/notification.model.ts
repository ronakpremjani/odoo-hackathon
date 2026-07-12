import { Schema, model, Document } from 'mongoose';
import { softDeletePlugin, SoftDeleteDocument } from '../plugins/softDelete.plugin';

export enum NotificationType {
  SYSTEM = 'System',
  TRIP = 'Trip',
  MAINTENANCE = 'Maintenance',
  SAFETY = 'Safety',
  EXPENSE = 'Expense',
  ALERT = 'Alert'
}

export enum NotificationPriority {
  LOW = 'Low',
  NORMAL = 'Normal',
  HIGH = 'High',
  URGENT = 'Urgent'
}

export enum NotificationStatus {
  UNREAD = 'Unread',
  READ = 'Read',
  ARCHIVED = 'Archived'
}

export interface INotification extends Document, SoftDeleteDocument {
  recipient: Schema.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      default: NotificationType.SYSTEM,
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(NotificationPriority),
      default: NotificationPriority.NORMAL,
    },
    status: {
      type: String,
      enum: Object.values(NotificationStatus),
      default: NotificationStatus.UNREAD,
      index: true,
    },
    link: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Apply soft delete plugin
NotificationSchema.plugin(softDeletePlugin);

export const Notification = model<INotification>('Notification', NotificationSchema);
