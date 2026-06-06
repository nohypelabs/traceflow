const { PrismaClient } = require('../src/generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Creating demo user...');
  
  // Check if demo user exists
  const existing = await prisma.user.findUnique({
    where: { email: 'admin@traceflow.com' },
  });

  if (existing) {
    console.log('Demo user already exists');
    return;
  }

  // Get or create organization
  let org = await prisma.organization.findFirst();
  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: 'TraceFlow Demo',
        slug: 'traceflow-demo',
      },
    });
  }

  // Create demo user
  const hashedPassword = await bcrypt.hash('admin112233', 12);
  const user = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@traceflow.com',
      password: hashedPassword,
      role: 'ADMIN',
      organizationId: org.id,
    },
  });

  console.log('Demo user created:');
  console.log('  Email: admin@traceflow.com');
  console.log('  Password: admin112233');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
