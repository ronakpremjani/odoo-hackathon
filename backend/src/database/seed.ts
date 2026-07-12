import { Role } from '../models/role.model';
import { User } from '../models/user.model';

export const seedDB = async (): Promise<void> => {
  try {
    // 1. Seed Roles if none exist
    const roleCount = await Role.countDocuments();
    let adminRoleId = '';

    if (roleCount === 0) {
      console.log('Seeding default roles...');
      
      const rolesToSeed = [
        {
          name: 'Admin',
          permissions: ['all'],
          description: 'Full system administrator access'
        },
        {
          name: 'Fleet Manager',
          permissions: ['vehicles:read', 'vehicles:write', 'drivers:read', 'drivers:write', 'trips:read', 'trips:write', 'maintenance:read', 'maintenance:write'],
          description: 'Manages vehicles, drivers, trips, and scheduling'
        },
        {
          name: 'Safety Officer',
          permissions: ['vehicles:read', 'drivers:read', 'trips:read', 'maintenance:read', 'alerts:read', 'alerts:write'],
          description: 'Monitors driver compliance, trip safety, and logs alerts'
        },
        {
          name: 'Financial Analyst',
          permissions: ['expenses:read', 'expenses:write', 'fuel:read', 'reports:read'],
          description: 'Reviews expenses, fuel metrics, and billing reports'
        },
        {
          name: 'Driver',
          permissions: ['trips:read', 'trips:write', 'fuel:write', 'expenses:write'],
          description: 'Performs assigned trips, reports fuel fills and trip progress'
        }
      ];

      const createdRoles = await Role.insertMany(rolesToSeed);
      console.log(`Seeded ${createdRoles.length} default roles.`);
      
      const adminRole = createdRoles.find(r => r.name === 'Admin');
      if (adminRole) {
        adminRoleId = adminRole._id.toString();
      }
    } else {
      const adminRole = await Role.findOne({ name: 'Admin' });
      if (adminRole) {
        adminRoleId = adminRole._id.toString();
      }
    }

    // 2. Seed default Admin User if none exist
    const userCount = await User.countDocuments();
    if (userCount === 0 && adminRoleId) {
      console.log('Seeding default Admin user...');
      
      const adminUser = new User({
        name: 'TransitOps Admin',
        email: 'admin@transitops.com',
        password: 'adminpassword123',
        role: adminRoleId as any,
        isActive: true
      });

      await adminUser.save();
      console.log('Default Admin user seeded successfully.');
      console.log('  Email: admin@transitops.com');
      console.log('  Password: adminpassword123');
    }
  } catch (error) {
    console.error(`Database seeding failed: ${(error as Error).message}`);
  }
};
