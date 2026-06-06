const { PrismaClient } = require('../src/generated/prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Create default organization
  const org = await prisma.organization.create({
    data: {
      name: 'TraceFlow Demo',
      slug: 'traceflow-demo',
    },
  });
  console.log('Created organization:', org.name);

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@traceflow.io',
      password: hashedPassword,
      role: 'ADMIN',
      organizationId: org.id,
    },
  });
  console.log('Created admin user:', admin.email);

  // Create sample device
  const device = await prisma.device.create({
    data: {
      name: 'Truck A',
      imei: '123456789012345',
      provider: 'MOCK',
      vehiclePlate: 'B 1234 ABC',
      vehicleType: 'TRUCK',
      status: 'ONLINE',
      lastLatitude: -6.2088,
      lastLongitude: 106.8456,
      organizationId: org.id,
    },
  });
  console.log('Created device:', device.name);

  console.log('');
  console.log('Seeding completed!');
  console.log('');
  console.log('Login credentials:');
  console.log('  Admin: admin@traceflow.io / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
