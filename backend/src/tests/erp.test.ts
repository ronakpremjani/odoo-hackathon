// Set test environment database URI before imports connect
process.env.MONGODB_URI = 'mongodb://localhost:27017/transitops_test';
process.env.NODE_ENV = 'test';

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import { User } from '../models/user.model';
import { Role } from '../models/role.model';
import { Vehicle, VehicleStatus } from '../models/vehicle.model';
import { Driver, DriverStatus } from '../models/driver.model';
import { Trip } from '../models/trip.model';
import { Maintenance } from '../models/maintenance.model';
import { FuelLog } from '../models/fuelLog.model';
import { Expense } from '../models/expense.model';

describe('TransitOps ERP Integration Test Suite', () => {
  let adminToken: string;
  let adminRoleId: string;
  let driverRoleId: string;
  let testDriverUserId: string;

  beforeAll(async () => {
    // Ensure mongoose is connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Clear test database collections
    await Promise.all([
      User.deleteMany({}),
      Role.deleteMany({}),
      Vehicle.deleteMany({}),
      Driver.deleteMany({}),
      Trip.deleteMany({}),
      Maintenance.deleteMany({}),
      FuelLog.deleteMany({}),
      Expense.deleteMany({}),
    ]);

    // Seed test roles
    const roles = await Role.insertMany([
      { name: 'Admin', permissions: ['all'], description: 'Superuser' },
      { name: 'Driver', permissions: ['trips:read'], description: 'Driver operator' },
    ]);

    const adminRole = roles.find((r) => r.name === 'Admin')!;
    const driverRole = roles.find((r) => r.name === 'Driver')!;
    adminRoleId = adminRole._id.toString();
    driverRoleId = driverRole._id.toString();

    // Register admin user
    const adminUser = new User({
      name: 'Test Admin User',
      email: 'admin_test@transitops.com',
      password: 'adminpassword123',
      role: adminRoleId as any,
      isActive: true,
    });
    await adminUser.save();

    // Create a mock driver user
    const driverUser = new User({
      name: 'Test Operator',
      email: 'driver_test@transitops.com',
      password: 'driverpassword123',
      role: driverRoleId as any,
      isActive: true,
    });
    await driverUser.save();
    testDriverUserId = driverUser._id.toString();

    // Perform login to get admin authorization token
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin_test@transitops.com', password: 'adminpassword123' });

    adminToken = loginRes.body.data.tokens.accessToken;
  });

  afterAll(async () => {
    // Cleanup and disconnect database
    await mongoose.connection.db?.dropDatabase();
    await mongoose.connection.close();
  });

  describe('1. Authentication Endpoints', () => {
    it('should successfully log in admin user and retrieve JWT token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin_test@transitops.com', password: 'adminpassword123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tokens.accessToken).toBeDefined();
    });

    it('should block profile requests with invalid/missing token', async () => {
      const res = await request(app).get('/api/v1/auth/profile');
      expect(res.status).toBe(401);
    });

    it('should fetch the profile details of currently logged in user', async () => {
      const res = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('admin_test@transitops.com');
    });
  });

  describe('2. Fleet Vehicle Operations & Unique Registrations', () => {
    let createdVehicleId: string;

    it('should register a new vehicle successfully', async () => {
      const res = await request(app)
        .post('/api/v1/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          plateNumber: 'TX-7762',
          make: 'Freightliner',
          model: 'Cascadia 126',
          year: 2022,
          type: 'Truck',
          fuelType: 'Diesel',
          mileage: 120000,
          capacity: { payload: 15000 },
        });

      expect(res.status).toBe(201);
      expect(res.body.data.plateNumber).toBe('TX-7762');
      createdVehicleId = res.body.data._id;
    });

    it('should block duplicate plate number entries to maintain unique constraints', async () => {
      const res = await request(app)
        .post('/api/v1/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          plateNumber: 'TX-7762', // Duplicate
          make: 'Volvo',
          model: 'VNL 860',
          year: 2023,
          type: 'Truck',
          fuelType: 'Diesel',
          mileage: 100,
        });

      expect(res.status).toBe(400); // Unique index violation is caught and returned as bad request
    });

    it('should fetch operational metrics and ROI analysis for a vehicle', async () => {
      const res = await request(app)
        .get(`/api/v1/vehicles/${createdVehicleId}/metrics`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.vehicle.plateNumber).toBe('TX-7762');
      expect(res.body.data.analytics.roiPercentage).toBe(0); // Standard starting state
    });
  });

  describe('3. Driver Operator Registry', () => {

    it('should create a driver profile and associate it to a user', async () => {
      const res = await request(app)
        .post('/api/v1/drivers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          user: testDriverUserId,
          licenseNumber: 'DL-55291',
          licenseType: 'Class A',
          licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Non-expired
          phone: '+1 555-9011',
          emergencyContact: {
            name: 'Jane Doe',
            relationship: 'Spouse',
            phone: '+1 555-9012',
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.data.licenseNumber).toBe('DL-55291');
    });

    it('should enforce driver license validation block for expired licenses during trip dispatches', async () => {
      // Create another driver with an expired license
      const expiredUser = new User({
        name: 'Expired Operator',
        email: 'expired@transitops.com',
        password: 'securepass123',
        role: driverRoleId as any,
        isActive: true,
      });
      await expiredUser.save();

      const driverRes = await request(app)
        .post('/api/v1/drivers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          user: expiredUser._id.toString(),
          licenseNumber: 'DL-EXPIRED',
          licenseType: 'Class A',
          licenseExpiry: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // Expired 10 days ago
          phone: '+1 555-0000',
          emergencyContact: {
            name: 'Contact',
            relationship: 'Friend',
            phone: '+1 555-1111',
          },
        });

      const expiredDriverId = driverRes.body.data._id;

      // Find the registered vehicle
      const dbVehicle = await Vehicle.findOne({ plateNumber: 'TX-7762' });

      // Propose dispatching using expired driver
      const tripRes = await request(app)
        .post('/api/v1/trips')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          tripId: 'TRIP-EXP-VALIDATION',
          vehicle: dbVehicle!._id.toString(),
          driver: expiredDriverId,
          startLocation: { name: 'Austin', coordinates: [-97.7431, 30.2672] },
          endLocation: { name: 'Dallas', coordinates: [-96.7970, 32.7767] },
          estimatedStartTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedEndTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          startOdometer: 120000,
        });

      expect(tripRes.status).toBe(400); // Service-level exception handler throws Bad Request
      expect(tripRes.body.message).toContain('expired licenses');
    });
  });

  describe('4. Operational Dispatched state machine & Payload limits', () => {
    it('should prevent dispatch when cargo weight exceeds vehicle capacity limits', async () => {
      const dbVehicle = await Vehicle.findOne({ plateNumber: 'TX-7762' });
      const dbDriver = await Driver.findOne({ licenseNumber: 'DL-55291' });

      const res = await request(app)
        .post('/api/v1/trips')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          tripId: 'TRIP-OVERWEIGHT',
          vehicle: dbVehicle!._id.toString(),
          driver: dbDriver!._id.toString(),
          startLocation: { name: 'Dallas', coordinates: [-96.7970, 32.7767] },
          endLocation: { name: 'Houston', coordinates: [-95.3698, 29.7604] },
          estimatedStartTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedEndTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          startOdometer: 120000,
          cargoDetails: {
            description: 'Heavy Industrial Steel coils',
            weight: 25000, // Max capacity is 15000
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('cannot exceed vehicle capacity');
    });

    it('should successfully dispatch a valid trip, transitioning vehicle and driver to On Trip', async () => {
      const dbVehicle = await Vehicle.findOne({ plateNumber: 'TX-7762' });
      const dbDriver = await Driver.findOne({ licenseNumber: 'DL-55291' });

      const res = await request(app)
        .post('/api/v1/trips')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          tripId: 'TRIP-VALID-01',
          vehicle: dbVehicle!._id.toString(),
          driver: dbDriver!._id.toString(),
          startLocation: { name: 'Dallas', coordinates: [-96.7970, 32.7767] },
          endLocation: { name: 'Houston', coordinates: [-95.3698, 29.7604] },
          estimatedStartTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedEndTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          startOdometer: 120000,
          cargoDetails: {
            description: 'Consumer Electronics',
            weight: 12000,
          },
        });

      expect(res.status).toBe(201);

      // Verify state changes inside Mongoose
      const updatedVehicle = await Vehicle.findById(dbVehicle!._id);
      const updatedDriver = await Driver.findById(dbDriver!._id);

      expect(updatedVehicle!.status).toBe(VehicleStatus.ON_TRIP);
      expect(updatedDriver!.status).toBe(DriverStatus.ON_TRIP);
    });

    it('should transition driver and vehicle back to active available status on trip completion', async () => {
      const trip = await Trip.findOne({ tripId: 'TRIP-VALID-01' });

      const res = await request(app)
        .put(`/api/v1/trips/${trip!._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'Completed',
          endOdometer: 120240, // 240 miles run
        });

      expect(res.status).toBe(200);

      const updatedVehicle = await Vehicle.findById(trip!.vehicle);
      const updatedDriver = await Driver.findById(trip!.driver);

      expect(updatedVehicle!.status).toBe(VehicleStatus.ACTIVE);
      expect(updatedVehicle!.mileage).toBe(120240); // Synced odometer
      expect(updatedDriver!.status).toBe(DriverStatus.ACTIVE);
    });
  });

  describe('5. Maintenance Workflows & In-Shop transitions', () => {
    let maintenanceId: string;

    it('should schedule maintenance and transition the vehicle status to In Maintenance', async () => {
      const dbVehicle = await Vehicle.findOne({ plateNumber: 'TX-7762' });

      const res = await request(app)
        .post('/api/v1/maintenances')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          maintenanceId: 'REPAIR-771',
          vehicle: dbVehicle!._id.toString(),
          type: 'Corrective',
          priority: 'High',
          description: 'Alternator replacement & brake pad checks',
          scheduledDate: new Date().toISOString(),
        });

      expect(res.status).toBe(201);
      maintenanceId = res.body.data._id;

      const updatedVehicle = await Vehicle.findById(dbVehicle!._id);
      expect(updatedVehicle!.status).toBe(VehicleStatus.IN_MAINTENANCE);
    });

    it('should resolve maintenance work and transition the vehicle status back to Active', async () => {
      const res = await request(app)
        .put(`/api/v1/maintenances/${maintenanceId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'Completed',
          cost: 850,
          performedBy: 'Diesel Repairs Inc',
        });

      expect(res.status).toBe(200);

      const log = await Maintenance.findById(maintenanceId);
      const updatedVehicle = await Vehicle.findById(log!.vehicle);

      expect(updatedVehicle!.status).toBe(VehicleStatus.ACTIVE);
    });
  });

  describe('6. Financial Loggers & Dashboard stats', () => {
    it('should record fuel refill log and expense sheet correctly', async () => {
      const dbVehicle = await Vehicle.findOne({ plateNumber: 'TX-7762' });
      const dbDriver = await Driver.findOne({ licenseNumber: 'DL-55291' });

      const fuelRes = await request(app)
        .post('/api/v1/fuel-logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          vehicle: dbVehicle!._id.toString(),
          driver: dbDriver!._id.toString(),
          quantity: 120, // liters
          cost: 360,
          odometer: 120150,
        });

      expect(fuelRes.status).toBe(201);

      const expRes = await request(app)
        .post('/api/v1/expenses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          expenseId: 'EXP-TOLL-01',
          category: 'Toll',
          amount: 45,
          vehicle: dbVehicle!._id.toString(),
          description: 'Dallas North Tollway dispatch pass',
        });

      expect(expRes.status).toBe(201);
    });

    it('should fetch operational financials and ROI on the KPI dashboard metrics', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/kpis')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.financials.totalFuelCost).toBe(360);
      expect(res.body.data.financials.totalExpenses).toBe(0); // Expense not approved yet
    });
  });
});
