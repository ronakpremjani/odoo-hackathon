import { Schema, model, Document } from 'mongoose';
import { softDeletePlugin, SoftDeleteDocument } from '../plugins/softDelete.plugin';

export enum TripStatus {
  SCHEDULED = 'Scheduled',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  DELAYED = 'Delayed'
}

export interface ITrip extends Document, SoftDeleteDocument {
  tripId: string;
  vehicle: Schema.Types.ObjectId;
  driver: Schema.Types.ObjectId;
  startLocation: {
    name: string;
    coordinates?: [number, number]; // [longitude, latitude]
  };
  endLocation: {
    name: string;
    coordinates?: [number, number]; // [longitude, latitude]
  };
  status: TripStatus;
  startOdometer?: number;
  endOdometer?: number;
  actualStartTime?: Date;
  actualEndTime?: Date;
  estimatedStartTime: Date;
  estimatedEndTime: Date;
  cargoDetails?: {
    description: string;
    weight?: number; // In kg
  };
  createdAt: Date;
  updatedAt: Date;
}

const TripSchema = new Schema<ITrip>(
  {
    tripId: {
      type: String,
      required: [true, 'Trip ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle link is required'],
      index: true,
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: 'Driver',
      required: [true, 'Driver link is required'],
      index: true,
    },
    startLocation: {
      name: {
        type: String,
        required: [true, 'Start location name is required'],
        trim: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        validate: {
          validator: function (val: [number, number]) {
            if (!val) return true; // Optional field
            return val.length === 2 && val[0] >= -180 && val[0] <= 180 && val[1] >= -90 && val[1] <= 90;
          },
          message: 'Coordinates must be [longitude, latitude] format with valid ranges',
        },
      },
    },
    endLocation: {
      name: {
        type: String,
        required: [true, 'End location name is required'],
        trim: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        validate: {
          validator: function (val: [number, number]) {
            if (!val) return true; // Optional field
            return val.length === 2 && val[0] >= -180 && val[0] <= 180 && val[1] >= -90 && val[1] <= 90;
          },
          message: 'Coordinates must be [longitude, latitude] format with valid ranges',
        },
      },
    },
    status: {
      type: String,
      enum: Object.values(TripStatus),
      default: TripStatus.SCHEDULED,
      index: true,
    },
    startOdometer: {
      type: Number,
      min: [0, 'Start odometer cannot be negative'],
    },
    endOdometer: {
      type: Number,
      min: [0, 'End odometer cannot be negative'],
      validate: {
        validator: function (this: any, val: number) {
          if (val === undefined || val === null) return true;
          return this.startOdometer === undefined || val >= this.startOdometer;
        },
        message: 'End odometer must be greater than or equal to start odometer',
      },
    },
    actualStartTime: {
      type: Date,
    },
    actualEndTime: {
      type: Date,
    },
    estimatedStartTime: {
      type: Date,
      required: [true, 'Estimated start time is required'],
      index: true,
    },
    estimatedEndTime: {
      type: Date,
      required: [true, 'Estimated end time is required'],
      validate: {
        validator: function (this: any, val: Date) {
          return val > this.estimatedStartTime;
        },
        message: 'Estimated end time must be after estimated start time',
      },
    },
    cargoDetails: {
      description: {
        type: String,
        trim: true,
      },
      weight: {
        type: Number,
        min: [0, 'Cargo weight cannot be negative'],
      },
    },
  },
  {
    timestamps: true,
  }
);

// Apply soft delete plugin
TripSchema.plugin(softDeletePlugin);

export const Trip = model<ITrip>('Trip', TripSchema);
