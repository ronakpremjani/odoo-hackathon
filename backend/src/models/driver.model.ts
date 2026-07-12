import { Schema, model, Document } from 'mongoose';
import { softDeletePlugin, SoftDeleteDocument } from '../plugins/softDelete.plugin';

export enum LicenseType {
  CLASS_A = 'Class A',
  CLASS_B = 'Class B',
  CLASS_C = 'Class C',
  COMMERCIAL = 'Commercial',
  HEAVY_TRUCK = 'Heavy Truck'
}

export enum DriverStatus {
  ACTIVE = 'Active',
  ON_TRIP = 'On Trip',
  SUSPENDED = 'Suspended',
  ON_LEAVE = 'On Leave',
  INACTIVE = 'Inactive'
}

export interface IDriver extends Document, SoftDeleteDocument {
  user: Schema.Types.ObjectId;
  licenseNumber: string;
  licenseType: LicenseType;
  licenseExpiry: Date;
  status: DriverStatus;
  phone: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  currentVehicle?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DriverSchema = new Schema<IDriver>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User link is required'],
      unique: true,
      index: true,
    },
    licenseNumber: {
      type: String,
      required: [true, 'License number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    licenseType: {
      type: String,
      enum: Object.values(LicenseType),
      required: [true, 'License type is required'],
    },
    licenseExpiry: {
      type: Date,
      required: [true, 'License expiry date is required'],
    },
    status: {
      type: String,
      enum: Object.values(DriverStatus),
      default: DriverStatus.ACTIVE,
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Driver phone number is required'],
      trim: true,
    },
    emergencyContact: {
      name: {
        type: String,
        required: [true, 'Emergency contact name is required'],
        trim: true,
      },
      relationship: {
        type: String,
        required: [true, 'Emergency contact relationship is required'],
        trim: true,
      },
      phone: {
        type: String,
        required: [true, 'Emergency contact phone is required'],
        trim: true,
      },
    },
    currentVehicle: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
    },
  },
  {
    timestamps: true,
  }
);

// Apply soft delete plugin
DriverSchema.plugin(softDeletePlugin);

export const Driver = model<IDriver>('Driver', DriverSchema);
