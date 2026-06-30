import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Pass@123', 10);
  
  // Create Super Admin
  const superadmin = await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: {},
    create: {
      username: 'superadmin',
      password: passwordHash,
      role: 'super_admin',
      plainPassword: 'Pass@123'
    }
  });

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: passwordHash,
      role: 'admin',
      plainPassword: 'Pass@123'
    }
  });

  console.log('Successfully seeded accounts:');
  console.log(`- ${superadmin.username} (${superadmin.role})`);
  console.log(`- ${admin.username} (${admin.role})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
