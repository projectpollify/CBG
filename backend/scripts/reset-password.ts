import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const email = 'info@cuttingboard.ca';
    const password = 'Password123';

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      // Update existing user
      const updated = await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: {
          password: hashedPassword
        }
      });

      console.log('✓ Password reset successfully for:', updated.email);
      console.log('  Email:', email);
      console.log('  Password: Password123');
    } else {
      // Create new user - need to find a regionId first
      const regions = await prisma.$queryRaw<Array<{id: string}>>`
        SELECT id FROM "Settings" WHERE category = 'region' LIMIT 1
      `;

      let regionId = 'bc'; // default
      if (regions && regions.length > 0) {
        regionId = regions[0].id;
      }

      const newUser = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          role: 'OWNER',
          regionId: regionId,
          isActive: true
        }
      });

      console.log('✓ User created successfully:',newUser.email);
      console.log('  Email:', email);
      console.log('  Password: Password123');
      console.log('  Role: OWNER');
    }

  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
