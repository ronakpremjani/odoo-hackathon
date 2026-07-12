import { BaseService } from './base.service';
import { IVehicle } from '../models/vehicle.model';
import { VehicleRepository } from '../repositories/vehicle.repository';
import { FuelLog } from '../models/fuelLog.model';
import { Maintenance } from '../models/maintenance.model';
import { Expense } from '../models/expense.model';
import { Trip } from '../models/trip.model';
import { AppError } from '../utils/appError';

export class VehicleService extends BaseService<IVehicle> {
  constructor() {
    super(new VehicleRepository(), 'Vehicle');
  }

  // Calculate detailed vehicle operational metrics and ROI
  async getVehicleMetrics(vehicleId: string) {
    const vehicle = await this.repository.findById(vehicleId);
    if (!vehicle) {
      throw AppError.notFound(`Vehicle with ID ${vehicleId} not found`);
    }

    // 1. Calculate Fuel Cost
    const fuelLogs = await FuelLog.find({ vehicle: vehicleId, isDeleted: { $ne: true } });
    const totalFuelCost = fuelLogs.reduce((sum, log) => sum + log.cost, 0);
    const totalFuelQuantity = fuelLogs.reduce((sum, log) => sum + log.quantity, 0);

    // 2. Calculate Maintenance Cost
    const maintenances = await Maintenance.find({ vehicle: vehicleId, isDeleted: { $ne: true } });
    const totalMaintenanceCost = maintenances.reduce((sum, repair) => sum + repair.cost, 0);

    // 3. Calculate Other Expenses
    const expenses = await Expense.find({ vehicle: vehicleId, isDeleted: { $ne: true } });
    const totalOtherExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // 4. Total Operational Cost
    const totalOperationalCost = totalFuelCost + totalMaintenanceCost + totalOtherExpenses;

    // 5. Total Distance Driven from completed trips
    const trips = await Trip.find({ vehicle: vehicleId, status: 'Completed', isDeleted: { $ne: true } });
    const totalDistance = trips.reduce((sum, trip) => {
      const distance = (trip.endOdometer || 0) - (trip.startOdometer || 0);
      return sum + (distance > 0 ? distance : 0);
    }, 0);

    // 6. Fuel Efficiency (Distance run per Liter of fuel)
    const fuelEfficiency = totalFuelQuantity > 0 ? Number((totalDistance / totalFuelQuantity).toFixed(2)) : 0;

    // 7. Calculate ROI
    // Estimated Revenue is computed at a standard rate of $2.50 per mile
    const estimatedRevenue = totalDistance * 2.50;
    const vehicleRoi = totalOperationalCost > 0
      ? Number(((estimatedRevenue - totalOperationalCost) / totalOperationalCost * 100).toFixed(2))
      : estimatedRevenue > 0 ? 100 : 0;

    return {
      vehicle: {
        id: (vehicle as any)._id.toString(),
        plateNumber: vehicle.plateNumber,
        model: vehicle.model,
        status: vehicle.status,
      },
      fuel: {
        totalCost: totalFuelCost,
        totalQuantityLiters: totalFuelQuantity,
        efficiency: fuelEfficiency,
      },
      maintenance: {
        totalCost: totalMaintenanceCost,
        count: maintenances.length,
      },
      expenses: {
        totalOther: totalOtherExpenses,
      },
      operational: {
        totalCost: totalOperationalCost,
        totalDistance,
      },
      analytics: {
        estimatedRevenue,
        roiPercentage: vehicleRoi,
      },
    };
  }
}
