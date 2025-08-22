import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash password for all users (keeping it simple)
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create default users
  const users = [
    {
      email: 'admin@cuttingboardguys.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      region: 'BC',
      isActive: true
    },
    {
      email: 'user@cuttingboardguys.com',
      password: hashedPassword,
      name: 'Regular User',
      role: 'USER',
      region: 'BC',
      isActive: true
    },
    {
      email: 'demo@cuttingboardguys.com',
      password: hashedPassword,
      name: 'Demo User',
      role: 'USER',
      region: 'BC',
      isActive: true
    }
  ];

  // Create users (skip if already exist)
  for (const userData of users) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (!existingUser) {
      const user = await prisma.user.create({
        data: userData
      });
      console.log(`✅ Created user: ${user.email}`);
    } else {
      console.log(`⏭️  User already exists: ${userData.email}`);
    }
  }

  // Create some basic settings
  const settings = [
    {
      key: 'company_name',
      value: 'Cutting Board Guys',
      description: 'Business name'
    },
    {
      key: 'gst_rate',
      value: '0.05',
      description: 'GST tax rate (5%)'
    },
    {
      key: 'pst_rate',
      value: '0.07',
      description: 'PST tax rate (7%)'
    },
    {
      key: 'invoice_prefix',
      value: 'CBG',
      description: 'Invoice number prefix'
    }
  ];

  for (const settingData of settings) {
    const existingSetting = await prisma.settings.findFirst({
      where: { key: settingData.key }
    });

    if (!existingSetting) {
      const setting = await prisma.settings.create({
        data: settingData
      });
      console.log(`⚙️  Created setting: ${setting.key}`);
    } else {
      console.log(`⏭️  Setting already exists: ${settingData.key}`);
    }
  }

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
