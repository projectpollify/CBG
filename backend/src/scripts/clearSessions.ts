import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearSessions() {
  try {
    const result = await prisma.session.deleteMany();
    console.log(`Cleared ${result.count} sessions from database`);
  } catch (error) {
    console.error('Error clearing sessions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearSessions();