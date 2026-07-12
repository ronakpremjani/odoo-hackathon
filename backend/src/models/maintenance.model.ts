import { Schema, model, Document } from 'mongoose';
import { softDeletePlugin, SoftDeleteDocument } from '../plugins/softDelete.plugin';

export enum MaintenanceType {
  PREVENTATIVE = 'Preventative',
  CORRECTIVE = 'Corrective',
  INSPECTION = 'Inspection',
  BREAKDOWN = 'Breakdown',
  OTHER = 'Other'
}

export enum MaintenanceStatus {
  SCHEDULED = 'Scheduled',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export enum MaintenancePriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface IMaintenance extends Document, SoftDeleteDocument {
  maintenanceId: string;
  vehicle: Schema.Types.ObjectId;
  type: MaintenanceType;
  description: string;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  cost: number;
  scheduledDate: Date;
  completedDate?: Date;
  performedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MaintenanceSchema = new Schema<IMaintenance>(
  {
    maintenanceId: {
      type: String,
      required: [true, 'Maintenance ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle reference is required'],
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(MaintenanceType),
      required: [true, 'Maintenance type is required'],
    },
    description: {
      type: String,
      required: [true, 'Description of maintenance is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(MaintenanceStatus),
      default: MaintenanceStatus.SCHEDULED,
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(MaintenancePriority),
      default: MaintenancePriority.MEDIUM,
    },
    cost: {
      type: Number,
      default: 0,
      min: [0, 'Maintenance cost cannot be negative'],
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
      index: true,
    },
    completedDate: {
      type: Date,
      validate: {
        validator: function (this: any, val: Date) {
          if (!val) return true;
          return val >= this.scheduledDate;
        },
        message: 'Completed date must be on or after the scheduled date',
      },
    },
    performedBy: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Apply soft delete plugin
MaintenanceSchema.plugin(softDeletePlugin);

export const Maintenance = model<IMaintenance>('Maintenance', MaintenanceSchema);
