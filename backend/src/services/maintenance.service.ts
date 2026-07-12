import { BaseService } from './base.service';
import { IMaintenance, MaintenanceStatus } from '../models/maintenance.model';
import { MaintenanceRepository } from '../repositories/maintenance.repository';
import { Vehicle, VehicleStatus } from '../models/vehicle.model';
import { AppError } from '../utils/appError';

export class MaintenanceService extends BaseService<IMaintenance> {
  private readonly maintenanceRepository = new MaintenanceRepository();

  constructor() {
    super(new MaintenanceRepository(), 'Maintenance');
  }

  // Override create to change Vehicle status to 'In Maintenance'
  async create(data: Partial<IMaintenance>): Promise<IMaintenance> {
    const { vehicle: vehicleId } = data;

    if (!vehicleId) {
      throw AppError.badRequest('Vehicle reference is required to schedule maintenance');
    }

    const vehicle = await Vehicle.findOne({ _id: vehicleId, isDeleted: { $ne: true } });
    if (!vehicle) {
      throw AppError.notFound(`Vehicle with ID ${vehicleId} not found`);
    }

    if (vehicle.status === VehicleStatus.RETIRED) {
      throw AppError.badRequest('Retired vehicles cannot be scheduled for maintenance');
    }

    const newMaintenance = await super.create(data);

    // Set Vehicle status to In Maintenance (In Shop)
    await Vehicle.findByIdAndUpdate(vehicleId, { status: VehicleStatus.IN_MAINTENANCE });

    return newMaintenance;
  }

  // Override update to change Vehicle status back to 'Active' upon completion/cancellation
  async update(id: string, data: any): Promise<IMaintenance> {
    const existingMaintenance = await this.maintenanceRepository.findById(id);
    if (!existingMaintenance) {
      throw AppError.notFound(`Maintenance with ID ${id} not found`);
    }

    const updatedMaintenance = await super.update(id, data);

    const { status } = data;

    if (status === MaintenanceStatus.COMPLETED || status === MaintenanceStatus.CANCELLED) {
      // Set Vehicle status back to Active (Available)
      await Vehicle.findByIdAndUpdate(existingMaintenance.vehicle, { status: VehicleStatus.ACTIVE });
    }

    return updatedMaintenance;
  }
}
