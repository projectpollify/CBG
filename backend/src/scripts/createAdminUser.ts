import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@cuttingboardguys.com' }
    });

    if (existingUser) {
      console.log('Admin user already exists');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('CBG2024!', 10);

    // Create the admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@cuttingboardguys.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'OWNER',
        regionId: 'BC_VANCOUVER',
        isActive: true
      }
    });

    console.log('Admin user created successfully:', {
      email: adminUser.email,
      name: `${adminUser.firstName} ${adminUser.lastName}`,
      role: adminUser.role
    });

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createAdminUser();