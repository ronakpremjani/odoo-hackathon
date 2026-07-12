import { BaseService } from './base.service';
import { ITrip, TripStatus } from '../models/trip.model';
import { TripRepository } from '../repositories/trip.repository';
import { Vehicle, VehicleStatus } from '../models/vehicle.model';
import { Driver, DriverStatus } from '../models/driver.model';
import { AppError } from '../utils/appError';

export class TripService extends BaseService<ITrip> {
  private readonly tripRepository = new TripRepository();

  constructor() {
    super(new TripRepository(), 'Trip');
  }

  // Override create to enforce dispatch business rules
  async create(data: Partial<ITrip>): Promise<ITrip> {
    const { vehicle: vehicleId, driver: driverId, cargoDetails } = data;

    if (!vehicleId || !driverId) {
      throw AppError.badRequest('Vehicle ID and Driver ID are required to dispatch a trip');
    }

    // 1. Fetch and validate Vehicle
    const vehicle = await Vehicle.findOne({ _id: vehicleId, isDeleted: { $ne: true } });
    if (!vehicle) {
      throw AppError.notFound(`Vehicle with ID ${vehicleId} not found`);
    }
    if (vehicle.status === VehicleStatus.RETIRED) {
      throw AppError.badRequest('Retired vehicles cannot be dispatched');
    }
    if (vehicle.status === VehicleStatus.IN_MAINTENANCE) {
      throw AppError.badRequest('Vehicles in maintenance cannot be dispatched');
    }
    if (vehicle.status === VehicleStatus.ON_TRIP) {
      throw AppError.badRequest('Vehicle is already assigned to another active trip');
    }

    // 2. Fetch and validate Driver
    const driver = await Driver.findOne({ _id: driverId, isDeleted: { $ne: true } });
    if (!driver) {
      throw AppError.notFound(`Driver with ID ${driverId} not found`);
    }
    if (new Date(driver.licenseExpiry) < new Date()) {
      throw AppError.badRequest('Drivers with expired licenses cannot be assigned');
    }
    if (driver.status === DriverStatus.SUSPENDED) {
      throw AppError.badRequest('Suspended drivers cannot be assigned');
    }
    if (driver.status === DriverStatus.ON_TRIP) {
      throw AppError.badRequest('Driver is already assigned to another active trip');
    }

    // 3. Validate Cargo Weight vs Vehicle Payload
    const cargoWeight = cargoDetails?.weight || 0;
    const maxPayload = vehicle.capacity?.payload || 0;
    if (cargoWeight > maxPayload) {
      throw AppError.badRequest(`Cargo weight (${cargoWeight}kg) cannot exceed vehicle capacity (${maxPayload}kg)`);
    }

    // 4. Save Trip in database
    const newTrip = await super.create(data);

    // 5. Transition Vehicle and Driver status to 'On Trip'
    await Vehicle.findByIdAndUpdate(vehicleId, { status: VehicleStatus.ON_TRIP });
    await Driver.findByIdAndUpdate(driverId, { status: DriverStatus.ON_TRIP });

    return newTrip;
  }

  // Override update to handle trip completion and cancellation transitions
  async update(id: string, data: any): Promise<ITrip> {
    const existingTrip = await this.tripRepository.findById(id);
    if (!existingTrip) {
      throw AppError.notFound(`Trip with ID ${id} not found`);
    }

    const { status, endOdometer } = data;

    // Validate odometer progression upon completion
    if (status === TripStatus.COMPLETED) {
      const finalOdometer = endOdometer !== undefined ? endOdometer : existingTrip.endOdometer;
      if (finalOdometer === undefined || finalOdometer === null) {
        throw AppError.badRequest('End odometer reading is required to complete a trip');
      }
      if (finalOdometer < existingTrip.startOdometer) {
        throw AppError.badRequest(`End odometer (${finalOdometer}) cannot be less than start odometer (${existingTrip.startOdometer})`);
      }
    }

    const updatedTrip = await super.update(id, data);

    // Handle state transitions based on updated status
    if (status === TripStatus.COMPLETED) {
      const finalOdometer = endOdometer !== undefined ? endOdometer : existingTrip.endOdometer;

      // Reset statuses to Active/Available
      await Vehicle.findByIdAndUpdate(existingTrip.vehicle, {
        status: VehicleStatus.ACTIVE,
        mileage: finalOdometer, // Sync odometer to vehicle mileage
      });
      await Driver.findByIdAndUpdate(existingTrip.driver, { status: DriverStatus.ACTIVE });
    } else if (status === TripStatus.CANCELLED) {
      // Reset statuses to Active/Available
      await Vehicle.findByIdAndUpdate(existingTrip.vehicle, { status: VehicleStatus.ACTIVE });
      await Driver.findByIdAndUpdate(existingTrip.driver, { status: DriverStatus.ACTIVE });
    }

    return updatedTrip;
  }
}
