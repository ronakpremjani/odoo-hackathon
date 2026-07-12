import { Vehicle } from '../models/vehicle.model';
import { Driver } from '../models/driver.model';
import { Trip } from '../models/trip.model';
import { FuelLog } from '../models/fuelLog.model';
import { Expense } from '../models/expense.model';
import { Maintenance } from '../models/maintenance.model';

export class DashboardService {
  
  // Get high-level KPI Summary statistics with business formulas
  async getKpis() {
    const [
      totalVehicles,
      activeVehicles,
      onTripVehicles,
      totalDrivers,
      activeDrivers,
      activeTrips,
      pendingMaintenance,
    ] = await Promise.all([
      Vehicle.countDocuments({ status: { $ne: 'Retired' }, isDeleted: { $ne: true } }),
      Vehicle.countDocuments({ status: 'Active', isDeleted: { $ne: true } }),
      Vehicle.countDocuments({ status: 'On Trip', isDeleted: { $ne: true } }),
      Driver.countDocuments({ isDeleted: { $ne: true } }),
      Driver.countDocuments({ status: 'Active', isDeleted: { $ne: true } }),
      Trip.countDocuments({ status: 'In Progress', isDeleted: { $ne: true } }),
      Maintenance.countDocuments({ status: { $in: ['Scheduled', 'In Progress'] }, isDeleted: { $ne: true } }),
    ]);

    // Calculate total expenses (Paid/Approved)
    const expenseAggregate = await Expense.aggregate([
      { $match: { status: { $in: ['Paid', 'Approved'] }, isDeleted: { $ne: true } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalExpenses = expenseAggregate[0]?.total || 0;

    // Calculate total fuel quantity (liters) and cost
    const fuelAggregate = await FuelLog.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: null, totalLitres: { $sum: '$quantity' }, totalCost: { $sum: '$cost' } } },
    ]);
    const totalFuelLitres = fuelAggregate[0]?.totalLitres || 0;
    const totalFuelCost = fuelAggregate[0]?.totalCost || 0;

    // Calculate total maintenance cost
    const maintenanceCostAggregate = await Maintenance.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: null, total: { $sum: '$cost' } } },
    ]);
    const totalMaintenanceCost = maintenanceCostAggregate[0]?.total || 0;

    // Calculate total operational cost (sum of general expenses + fuel logs + repairs)
    const totalOperationalCost = totalExpenses + totalFuelCost + totalMaintenanceCost;

    // Calculate total distance driven from completed trips
    const tripDistanceAggregate = await Trip.aggregate([
      { $match: { status: 'Completed', isDeleted: { $ne: true } } },
      {
        $project: {
          distance: { $subtract: ['$endOdometer', '$startOdometer'] },
        },
      },
      {
        $group: {
          _id: null,
          totalDistance: { $sum: '$distance' },
        },
      },
    ]);
    const totalDistance = tripDistanceAggregate[0]?.totalDistance || 0;

    // Fuel Efficiency (km/miles per liter)
    const fuelEfficiency = totalFuelLitres > 0 ? Number((totalDistance / totalFuelLitres).toFixed(2)) : 0;

    // Fleet Utilization (%)
    const fleetUtilization = totalVehicles > 0 ? Number(((onTripVehicles / totalVehicles) * 100).toFixed(1)) : 0;

    // Vehicle availability rate (%)
    const vehicleAvailabilityRate = totalVehicles > 0 ? Number(((activeVehicles / totalVehicles) * 100).toFixed(1)) : 0;

    // Global ROI Percentage (using $2.50 per mile standard freight rate)
    const estimatedRevenue = totalDistance * 2.50;
    const globalRoi = totalOperationalCost > 0
      ? Number(((estimatedRevenue - totalOperationalCost) / totalOperationalCost * 100).toFixed(2))
      : estimatedRevenue > 0 ? 100 : 0;

    return {
      vehicles: {
        total: totalVehicles,
        active: activeVehicles,
        onTrip: onTripVehicles,
        availabilityRate: vehicleAvailabilityRate,
        utilization: fleetUtilization,
      },
      drivers: {
        total: totalDrivers,
        active: activeDrivers,
      },
      trips: {
        active: activeTrips,
        totalDistance,
      },
      maintenance: {
        pending: pendingMaintenance,
        totalCost: totalMaintenanceCost,
      },
      financials: {
        totalExpenses,
        totalFuelCost,
        totalOperationalCost,
        fuelEfficiency,
        estimatedRevenue,
        roiPercentage: globalRoi,
      },
    };
  }

  // Get Analytics Chart data
  async getAnalytics() {
    // 1. Monthly expenses breakdown (last 6 months)
    const expenseTrends = await Expense.aggregate([
      {
        $match: {
          status: { $in: ['Paid', 'Approved'] },
          isDeleted: { $ne: true },
          date: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) }, // last 6 months
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            year: { $year: '$date' },
            category: '$category',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // 2. Fuel Log trends (monthly fuel filled quantity & cost)
    const fuelTrends = await FuelLog.aggregate([
      {
        $match: {
          isDeleted: { $ne: true },
          date: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            year: { $year: '$date' },
          },
          totalLiters: { $sum: '$quantity' },
          totalCost: { $sum: '$cost' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // 3. Maintenance type breakdown
    const maintenanceBreakdown = await Maintenance.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalCost: { $sum: '$cost' },
        },
      },
    ]);

    // 4. Vehicle Status distribution
    const vehicleStatusDistribution = await Vehicle.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      expenseTrends: expenseTrends.map((t) => ({
        month: `${t._id.year}-${String(t._id.month).padStart(2, '0')}`,
        category: t._id.category,
        total: t.total,
      })),
      fuelTrends: fuelTrends.map((f) => ({
        month: `${f._id.year}-${String(f._id.month).padStart(2, '0')}`,
        totalLiters: f.totalLiters,
        totalCost: f.totalCost,
      })),
      maintenanceBreakdown: maintenanceBreakdown.map((m) => ({
        type: m._id,
        count: m.count,
        totalCost: m.totalCost,
      })),
      vehicleStatusDistribution: vehicleStatusDistribution.map((v) => ({
        status: v._id,
        count: v.count,
      })),
    };
  }
}
