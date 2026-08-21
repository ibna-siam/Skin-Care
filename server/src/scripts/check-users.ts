import { prisma } from '../config/db.js';
import bcrypt from 'bcryptjs';

async function check() {
  const users = await prisma.user.findMany();
  console.log('Total users:', users.length);
  for (const u of users) {
    console.log(`User: ${u.name} | Email: ${u.email} | Role: ${u.role}`);
  }

  // Check if admin@skincare.com.bd exists
  let adminSkincare = await prisma.user.findFirst({ where: { email: 'admin@skincare.com.bd' } });
  if (!adminSkincare) {
    console.log('Creating admin@skincare.com.bd & product@skincare.com.bd for quick admin login convenience...');
    const hash = await bcrypt.hash('password123', 10);
    await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: 'admin@skincare.com.bd',
        passwordHash: hash,
        role: 'SUPER_ADMIN',
      },
    });
    await prisma.user.create({
      data: {
        name: 'Product Manager',
        email: 'product@skincare.com.bd',
        passwordHash: hash,
        role: 'PRODUCT_MANAGER',
      },
    });
    console.log('Created admin@skincare.com.bd and product@skincare.com.bd with password123!');
  } else {
    // Ensure password is password123 if user expects password123 or ChangeMe123!
    const hash = await bcrypt.hash('password123', 10);
    await prisma.user.update({
      where: { email: 'admin@skincare.com.bd' },
      data: { passwordHash: hash, role: 'SUPER_ADMIN' },
    });
    console.log('Updated admin@skincare.com.bd password to password123');
  }

  // Also check products
  const productCount = await prisma.product.count();
  console.log('Total products in database:', productCount);
  const sampleProducts = await prisma.product.findMany({ take: 4 });
  console.log('Sample products:', sampleProducts.map(p => ({ id: p.id, name: p.name, price: p.price, stock: p.stock })));
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
