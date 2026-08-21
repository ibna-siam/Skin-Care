import { prisma } from '../config/db.js';
import bcrypt from 'bcryptjs';

async function testLogin() {
  const user = await prisma.user.findFirst({
    where: { email: 'admin@skincare.com.bd' },
  });

  if (!user) {
    console.error('User admin@skincare.com.bd not found!');
    return;
  }

  console.log('User found:', {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    resetPasswordToken: user.resetPasswordToken,
    authProvider: user.authProvider,
  });

  const isMatch = await bcrypt.compare('password123', user.passwordHash);
  console.log('Password match test for "password123":', isMatch);
}

testLogin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
