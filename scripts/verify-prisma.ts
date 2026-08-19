import { prisma } from '../lib/prisma.js';

async function main() {
  try {
    const productsCount = await prisma.product.count();
    const categoriesCount = await prisma.category.count();
    const usersCount = await prisma.user.count();

    console.log(`✅ Connected`);
    console.log(`📊 Prisma Postgres Statistics:`);
    console.log(`   - Products:   ${productsCount}`);
    console.log(`   - Categories: ${categoriesCount}`);
    console.log(`   - Users:      ${usersCount}`);
  } catch (error) {
    console.error('❌ Failed to connect to Prisma Postgres:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
