import { prisma } from '../config/db.js';

async function test() {
  const where: any = { status: 'ACTIVE' };
  const products = await prisma.product.findMany({
    where,
    take: 4,
    include: {
      brand: true,
      category: true,
      images: { orderBy: { sortOrder: 'asc' } },
      skinTypes: { include: { skinType: true } },
      skinConcerns: { include: { skinConcern: true } },
    },
  });

  console.log(`Fetched ${products.length} products successfully!`);
  for (const p of products) {
    console.log(`- ${p.name} | Price: ৳${p.price} | Images: ${p.images.length} | Brand: ${p.brand?.name}`);
  }
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
