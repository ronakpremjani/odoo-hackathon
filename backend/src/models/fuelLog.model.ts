import { Schema, model, Document } from 'mongoose';
import { softDeletePlugin, SoftDeleteDocument } from '../plugins/softDelete.plugin';

export interface IFuelLog extends Document, SoftDeleteDocument {
  vehicle: Schema.Types.ObjectId;
  driver: Schema.Types.ObjectId;
  trip?: Schema.Types.ObjectId;
  date: Date;
  quantity: number; // Liters
  cost: number;
  odometer: number;
  fuelStation?: string;
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FuelLogSchema = new Schema<IFuelLog>(
  {
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle reference is required'],
      index: true,
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: 'Driver',
      required: [true, 'Driver reference is required'],
      index: true,
    },
    trip: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
    },
    date: {
      type: Date,
      required: [true, 'Fuel log date is required'],
      default: Date.now,
      index: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Fuel quantity (liters) is required'],
      min: [0.1, 'Fuel quantity must be greater than 0'],
    },
    cost: {
      type: Number,
      required: [true, 'Total cost is required'],
      min: [0, 'Cost cannot be negative'],
    },
    odometer: {
      type: Number,
      required: [true, 'Odometer reading is required'],
      min: [0, 'Odometer reading cannot be negative'],
    },
    fuelStation: {
      type: String,
      trim: true,
    },
    receiptUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Apply soft delete plugin
FuelLogSchema.plugin(softDeletePlugin);

export const FuelLog = model<IFuelLog>('FuelLog', FuelLogSchema);
