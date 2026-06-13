import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');
  
  // Clear existing users to prevent conflicts if re-running
  await prisma.user.deleteMany();
  
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      password: hashedPassword,
      plainPassword: 'admin123',
      role: 'admin'
    }
  });
  
  console.log(`Created default admin user: ${admin.username} / admin123`);
  
  // Also create a super_admin for testing
  const superAdminHashed = await bcrypt.hash('superadmin123', 10);
  const superAdmin = await prisma.user.create({
    data: {
      username: 'superadmin',
      password: superAdminHashed,
      plainPassword: 'superadmin123',
      role: 'super_admin'
    }
  });
  
  console.log(`Created default super admin: ${superAdmin.username} / superadmin123`);
  
  // Create system settings
  await prisma.systemSetting.create({
    data: {
      orgName: 'Shaad-Mates WebSuite',
      orgLogo: '🎓',
      orgEmail: 'admin@shaadmates.com',
      signatureUrl: ''
    }
  });
  console.log('Created default system settings.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
