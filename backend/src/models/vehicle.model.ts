import { Schema, model } from 'mongoose';
import { softDeletePlugin, SoftDeleteDocument } from '../plugins/softDelete.plugin';

export enum VehicleType {
  TRUCK = 'Truck',
  VAN = 'Van',
  CAR = 'Car',
  BUS = 'Bus',
  TRAILER = 'Trailer',
  OTHER = 'Other'
}

export enum VehicleStatus {
  ACTIVE = 'Active',
  ON_TRIP = 'On Trip',
  IN_MAINTENANCE = 'In Maintenance',
  OUT_OF_SERVICE = 'Out of Service',
  RETIRED = 'Retired'
}

export enum FuelType {
  DIESEL = 'Diesel',
  PETROL = 'Petrol',
  ELECTRIC = 'Electric',
  HYBRID = 'Hybrid',
  GAS = 'Gas'
}

export interface IVehicle extends SoftDeleteDocument {
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  type: VehicleType;
  status: VehicleStatus;
  vin?: string;
  mileage: number;
  fuelType: FuelType;
  capacity: {
    payload?: number; // In kg
    volume?: number;  // In cubic meters
  };
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    plateNumber: {
      type: String,
      required: [true, 'Plate number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    make: {
      type: String,
      required: [true, 'Vehicle make/brand is required'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Vehicle model is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Vehicle year is required'],
      min: [1900, 'Year cannot be before 1900'],
      max: [new Date().getFullYear() + 1, 'Invalid vehicle year'],
    },
    type: {
      type: String,
      enum: Object.values(VehicleType),
      default: VehicleType.TRUCK,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(VehicleStatus),
      default: VehicleStatus.ACTIVE,
      index: true,
    },
    vin: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
      sparse: true,
    },
    mileage: {
      type: Number,
      default: 0,
      min: [0, 'Mileage cannot be negative'],
    },
    fuelType: {
      type: String,
      enum: Object.values(FuelType),
      default: FuelType.DIESEL,
    },
    capacity: {
      payload: {
        type: Number,
        min: [0, 'Payload capacity cannot be negative'],
      },
      volume: {
        type: Number,
        min: [0, 'Volume capacity cannot be negative'],
      },
    },
  },
  {
    timestamps: true,
  }
);

// Apply soft delete plugin
VehicleSchema.plugin(softDeletePlugin);

export const Vehicle = model<IVehicle>('Vehicle', VehicleSchema);
