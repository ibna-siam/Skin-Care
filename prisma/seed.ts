import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding Skincare E-Commerce Database...');

  // 1. Clean existing data
  await prisma.banner.deleteMany();
  await prisma.reviewImage.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderTimeline.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productSkinType.deleteMany();
  await prisma.productSkinConcern.deleteMany();
  await prisma.product.deleteMany();
  await prisma.skinConcern.deleteMany();
  await prisma.skinType.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.homepageSection.deleteMany();
  await prisma.skinQuizAnswer.deleteMany();
  await prisma.skinQuizQuestion.deleteMany();

  // 2. Users (Admin + Customer)
  const adminPasswordHash = await bcrypt.hash('ChangeMe123!', 10);
  const customerPasswordHash = await bcrypt.hash('Customer123!', 10);

  const adminUser = await prisma.user.create({
    data: {
      name: 'Skincare Admin',
      email: 'admin@example.com',
      phone: '+8801700000001',
      passwordHash: adminPasswordHash,
      role: 'SUPER_ADMIN',
    },
  });

  const demoCustomer = await prisma.user.create({
    data: {
      name: 'Ayesha Rahman',
      email: 'customer@example.com',
      phone: '+8801712345678',
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
      preferredSkinType: 'Combination',
      addresses: {
        create: {
          recipientName: 'Ayesha Rahman',
          phone: '+8801712345678',
          division: 'Dhaka',
          district: 'dhaka-city',
          area: 'Gulshan-2',
          fullAddress: 'House 42, Road 11, Block D, Gulshan-2, Dhaka',
          postalCode: '1212',
          isDefault: true,
        },
      },
    },
  });

  console.log('👤 Admin and Demo Customer created');

  // 3. Brands with Real Logos
  const brandsData = [
    {
      name: 'CeraVe',
      slug: 'cerave',
      country: 'United States',
      isFeatured: true,
      logoUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=300&auto=format&fit=crop',
      website: 'https://www.cerave.com',
      description: 'Dermatologist-developed skincare formulated with 3 essential ceramides.',
    },
    {
      name: 'The Ordinary',
      slug: 'the-ordinary',
      country: 'Canada',
      isFeatured: true,
      logoUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=300&auto=format&fit=crop',
      website: 'https://theordinary.com',
      description: 'Clinical formulations with integrity, high-potency single ingredient serums.',
    },
    {
      name: 'Minimalist',
      slug: 'minimalist',
      country: 'India',
      isFeatured: true,
      logoUrl: 'https://images.unsplash.com/photo-1608248597359-00976156e520?q=80&w=300&auto=format&fit=crop',
      website: 'https://beminimalist.co',
      description: 'Transparent, active-rich skincare powered by science.',
    },
    {
      name: 'Neutrogena',
      slug: 'neutrogena',
      country: 'United States',
      isFeatured: true,
      logoUrl: 'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?q=80&w=300&auto=format&fit=crop',
      website: 'https://www.neutrogena.com',
      description: 'Dermatologist-recommended skincare for clear, healthy skin.',
    },
    {
      name: 'COSRX',
      slug: 'cosrx',
      country: 'South Korea',
      isFeatured: true,
      logoUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=300&auto=format&fit=crop',
      website: 'https://www.cosrx.com',
      description: 'Korean skincare solutions with snail mucin and gentle exfoliants.',
    },
    {
      name: 'WOW Skin Science',
      slug: 'wow-skin-science',
      country: 'India',
      isFeatured: true,
      logoUrl: 'https://images.unsplash.com/photo-1567928815116-25f0a4f5b5f2?q=80&w=300&auto=format&fit=crop',
      website: 'https://www.buywow.in',
      description: 'Nature-infused skincare with aloe vera, apple cider vinegar, and tea tree.',
    },
    {
      name: 'La Roche-Posay',
      slug: 'la-roche-posay',
      country: 'France',
      isFeatured: true,
      logoUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=300&auto=format&fit=crop',
      website: 'https://www.laroche-posay.us',
      description: 'Thermal spring water skincare recommended for sensitive skin.',
    },
    {
      name: 'Beauty of Joseon',
      slug: 'beauty-of-joseon',
      country: 'South Korea',
      isFeatured: true,
      logoUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=300&auto=format&fit=crop',
      website: 'https://beautyofjoseon.com',
      description: 'Hanbang traditional herbal medicine modernized for glowing skin.',
    },
    {
      name: 'Cetaphil',
      slug: 'cetaphil',
      country: 'United States',
      isFeatured: true,
      logoUrl: 'https://images.unsplash.com/photo-1556228722-d0b5b244719c?q=80&w=300&auto=format&fit=crop',
      website: 'https://www.cetaphil.com',
      description: 'Gentle, pH-balanced cleansers and moisturizers for all skin types.',
    },
  ];

  const brandMap = new Map<string, string>();
  for (const b of brandsData) {
    const brand = await prisma.brand.create({ data: b });
    brandMap.set(b.slug, brand.id);
  }

  // 4. Categories with Authentic Sample Images
  const categoriesData = [
    {
      name: 'Cleansers',
      slug: 'cleansers',
      sortOrder: 1,
      isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop',
      description: 'Gentle face washes, foaming gel cleansers, and oil-free acne washes.',
    },
    {
      name: 'Serums',
      slug: 'serums',
      sortOrder: 2,
      isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop',
      description: 'High potency active serums for brightening, dark spots, and anti-aging.',
    },
    {
      name: 'Moisturizers',
      slug: 'moisturizers',
      sortOrder: 3,
      isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1556228722-d0b5b244719c?q=80&w=600&auto=format&fit=crop',
      description: 'Hydrating barrier repair creams, lotions, and soothing gels.',
    },
    {
      name: 'Sunscreen',
      slug: 'sunscreen',
      sortOrder: 4,
      isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=600&auto=format&fit=crop',
      description: 'Broad-spectrum UVA/UVB SPF 50+ PA++++ sun protection with no white cast.',
    },
    {
      name: 'Toners',
      slug: 'toners',
      sortOrder: 5,
      isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=600&auto=format&fit=crop',
      description: 'Exfoliating AHA/BHA and hydrating prep toners for glass skin.',
    },
    {
      name: 'Men Skincare',
      slug: 'men',
      sortOrder: 6,
      isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
      description: 'Formulated specifically for men skin texture, post-shave care, and oil control.',
    },
    {
      name: 'Face Masks',
      slug: 'face-masks',
      sortOrder: 7,
      isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1567928815116-25f0a4f5b5f2?q=80&w=600&auto=format&fit=crop',
      description: 'Hydrating Korean sheet masks and clarifying clay pore treatments.',
    },
    {
      name: 'Body Care',
      slug: 'body-care',
      sortOrder: 8,
      isFeatured: false,
      imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600&auto=format&fit=crop',
      description: 'Nourishing ceramide body lotions and calming post-sun body care.',
    },
  ];

  const categoryMap = new Map<string, string>();
  for (const c of categoriesData) {
    const category = await prisma.category.create({ data: c });
    categoryMap.set(c.slug, category.id);
  }

  // 5. Skin Types & Concerns
  const skinTypesData = [
    { name: 'Normal', slug: 'normal', description: 'Balanced, neither too oily nor too dry.' },
    { name: 'Dry', slug: 'dry', description: 'Feels tight, flaky, or lacks moisture.' },
    { name: 'Oily', slug: 'oily', description: 'Excess shine, enlarged pores, prone to congestion.' },
    { name: 'Combination', slug: 'combination', description: 'Oily T-zone (forehead, nose) and dry or normal cheeks.' },
    { name: 'Sensitive', slug: 'sensitive', description: 'Easily irritated, redness, stinging, or reactive.' },
  ];

  const skinTypeMap = new Map<string, string>();
  for (const st of skinTypesData) {
    const created = await prisma.skinType.create({ data: st });
    skinTypeMap.set(st.slug, created.id);
  }

  const skinConcernsData = [
    { name: 'Acne & Blemishes', slug: 'acne', description: 'Breakouts, blackheads, and clogged pores.' },
    { name: 'Dark Spots & Pigmentation', slug: 'dark-spots', description: 'Sun damage, melasma, and post-acne marks.' },
    { name: 'Dryness & Dehydration', slug: 'dryness', description: 'Dullness, flakiness, and weakened skin barrier.' },
    { name: 'Aging & Fine Lines', slug: 'aging', description: 'Loss of elasticity, fine lines, and wrinkles.' },
    { name: 'Dullness', slug: 'dullness', description: 'Lack of radiance and uneven texture.' },
    { name: 'Redness & Irritation', slug: 'redness', description: 'Inflamed or rosacea-prone skin.' },
  ];

  const skinConcernMap = new Map<string, string>();
  for (const sc of skinConcernsData) {
    const created = await prisma.skinConcern.create({ data: sc });
    skinConcernMap.set(sc.slug, created.id);
  }

  // 6. Realistic Skincare Products (Including the exact 4 from the reference design)
  const productsData = [
    // --- EXACT 4 BEST SELLERS FROM HOMEPAGE REFERENCE ---
    {
      name: 'CeraVe Foaming Cleanser',
      slug: 'cerave-foaming-cleanser',
      brandSlug: 'cerave',
      categorySlug: 'cleansers',
      price: 1350,
      compareAtPrice: 1550,
      sku: 'CRV-FC-236',
      stock: 45,
      gender: 'UNISEX',
      description: 'CeraVe Foaming Facial Cleanser features ceramides, hyaluronic acid and niacinamide to help restore the skin barrier, attract hydration and calm the skin. Developed with dermatologists, it deeply cleanses, removes oil and refreshes without over-stripping.',
      shortDescription: 'Daily foaming cleanser for normal-to-oily skin with 3 essential ceramides.',
      ingredients: 'Aqua / Water / Eau, Cocamidopropyl Hydroxysultaine, Glycerin, Sodium Lauroyl Sarcosinate, PEG-150 Pentaerythrityl Tetrastearate, Niacinamide, Ceramide NP, Ceramide AP, Ceramide EOP, Carbomer, Sodium Hyaluronate.',
      benefits: 'Cleanses and removes oil without disrupting the protective skin barrier. Contains 3 essential ceramides and hyaluronic acid.',
      howToUse: 'Wet skin with lukewarm water. Massage cleanser into skin in a gentle, circular motion. Rinse well.',
      countryOfOrigin: 'USA',
      isBestSeller: true,
      isFeatured: true,
      averageRating: 4.9,
      reviewCount: 124,
      badge: 'Best Seller',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop',
      skinTypes: ['normal', 'oily', 'combination'],
      skinConcerns: ['acne', 'dullness'],
    },
    {
      name: 'Neutrogena Oil-Free Acne Wash',
      slug: 'neutrogena-oil-free-acne-wash',
      brandSlug: 'neutrogena',
      categorySlug: 'cleansers',
      price: 1150,
      compareAtPrice: 1300,
      sku: 'NTG-OFAW-175',
      stock: 32,
      gender: 'UNISEX',
      description: 'Neutrogena Oil-Free Acne Wash is the #1 dermatologist recommended acne-fighting facial cleanser. Formulated with 2% Salicylic Acid and soothing aloe extract, it gently cleanses deep into pores for clearer skin.',
      shortDescription: 'Salicylic acid face wash for breakout-prone skin.',
      ingredients: 'Salicylic Acid 2%, Water, Sodium C14-16 Olefin Sulfonate, Cocamidopropyl Betaine, Chamomilla Recutita (Matricaria) Flower Extract, Aloe Barbadensis Leaf Extract.',
      benefits: 'Clinically proven MicroClear technology boosts delivery of salicylic acid directly to the source of breakouts.',
      howToUse: 'Cleanse twice a day. Wet face, apply to hands, add water and work into a lather. Massage face gently.',
      countryOfOrigin: 'USA',
      isBestSeller: true,
      isFeatured: true,
      averageRating: 4.7,
      reviewCount: 88,
      badge: 'Trending',
      image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=800&auto=format&fit=crop',
      skinTypes: ['oily', 'combination'],
      skinConcerns: ['acne', 'redness'],
    },
    {
      name: 'Minimalist Vitamin C 10% Serum',
      slug: 'minimalist-vitamin-c-serum',
      brandSlug: 'minimalist',
      categorySlug: 'serums',
      price: 1250,
      compareAtPrice: 1450,
      sku: 'MIN-VITC-30',
      stock: 60,
      gender: 'UNISEX',
      description: 'Formulated with Ethyl Ascorbic Acid (a stable form of Vitamin C) and Centella Asiatica Water, this brightening serum reduces hyperpigmentation, boosts collagen, and protects skin from environmental oxidative stress.',
      shortDescription: '10% Ethyl Ascorbic Acid with Centella for bright glowing skin.',
      ingredients: 'Centella Asiatica Leaf Water, 3-O-Ethyl Ascorbic Acid, Ethoxydiglycol, Dimethyl Isosorbide, Glycerin, Sodium Gluconate, Ferulic Acid.',
      benefits: 'Fades dark spots, evens out skin tone, and illuminates dull skin without causing irritation or oxidation.',
      howToUse: 'Apply 2-3 drops after cleansing and toning in the AM routine. Follow with moisturizer and sunscreen.',
      countryOfOrigin: 'India',
      isBestSeller: true,
      isFeatured: true,
      averageRating: 4.8,
      reviewCount: 156,
      badge: 'Best Seller',
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop',
      skinTypes: ['normal', 'dry', 'oily', 'combination'],
      skinConcerns: ['dark-spots', 'dullness', 'aging'],
    },
    {
      name: 'WOW Skin Science Aloe Vera Gel',
      slug: 'wow-aloe-vera-gel',
      brandSlug: 'wow-skin-science',
      categorySlug: 'moisturizers',
      price: 750,
      compareAtPrice: 900,
      sku: 'WOW-AVG-250',
      stock: 75,
      gender: 'UNISEX',
      description: '99% Pure Aloe Vera Gel hygienically extracted from ripe organic aloe vera leaves. Loaded with over 75 beneficial nutrients including vitamins, enzymes, and minerals that soothe, moisturize, and heal skin.',
      shortDescription: '99% pure soothing multi-purpose aloe vera moisturizer.',
      ingredients: 'Pure Aloe Vera Leaf Juice, Xanthan Gum, Sodium Benzoate, Potassium Sorbate, Citric Acid.',
      benefits: 'Instantly calms sunburns, soothes inflammation, hydrates dry patches, and can be used as a sleeping mask or post-shave gel.',
      howToUse: 'Apply liberally over cleansed face, body, or scalp. Massage until absorbed.',
      countryOfOrigin: 'India',
      isBestSeller: true,
      isFeatured: true,
      averageRating: 4.6,
      reviewCount: 94,
      badge: 'Popular',
      image: 'https://images.unsplash.com/photo-1567928815104-b7980ee5032e?q=80&w=800&auto=format&fit=crop',
      skinTypes: ['normal', 'dry', 'oily', 'combination', 'sensitive'],
      skinConcerns: ['dryness', 'redness'],
    },

    // --- ADDITIONAL POPULAR AUTHENTIC PRODUCTS ---
    {
      name: 'The Ordinary Niacinamide 10% + Zinc 1%',
      slug: 'the-ordinary-niacinamide-10-zinc-1',
      brandSlug: 'the-ordinary',
      categorySlug: 'serums',
      price: 1150,
      compareAtPrice: 1350,
      sku: 'ORD-NZ-30',
      stock: 50,
      gender: 'UNISEX',
      description: 'High-strength vitamin and mineral blemish formula with 10% pure Niacinamide and 1% Zinc PCA to balance visible sebum activity and reduce skin congestion.',
      shortDescription: 'Regulates oil, minimizes enlarged pores, and calms redness.',
      ingredients: 'Aqua (Water), Niacinamide, Pentylene Glycol, Zinc PCA, Dimethyl Isosorbide, Tamarindus Indica Seed Gum, Xanthan Gum.',
      benefits: 'Balances oil production, visibly improves skin texture, and strengthens the skin barrier.',
      howToUse: 'Apply to entire face morning and evening before heavier creams.',
      countryOfOrigin: 'Canada',
      isBestSeller: true,
      isFeatured: true,
      averageRating: 4.9,
      reviewCount: 230,
      badge: 'Authentic 100%',
      image: 'https://images.unsplash.com/photo-1608248597359-00976156e520?q=80&w=800&auto=format&fit=crop',
      skinTypes: ['oily', 'combination', 'normal'],
      skinConcerns: ['acne', 'dark-spots', 'dullness'],
    },
    {
      name: 'COSRX Advanced Snail 96 Mucin Power Essence',
      slug: 'cosrx-advanced-snail-96-mucin-essence',
      brandSlug: 'cosrx',
      categorySlug: 'serums',
      price: 1650,
      compareAtPrice: 1900,
      sku: 'CSX-SN96-100',
      stock: 40,
      gender: 'UNISEX',
      description: 'Enriched with 96.3% skin-boosting Snail Secretion Filtrate, this light-weight essence absorbs quickly into the skin to give you a natural, healthy glass-skin glow.',
      shortDescription: 'Cult-favorite Korean glass-skin hydrating snail essence.',
      ingredients: 'Snail Secretion Filtrate, Betaine, Butylene Glycol, 1,2-Hexanediol, Sodium Hyaluronate, Panthenol, Arginine, Allantoin.',
      benefits: 'Repairs damaged skin barrier, fades hyperpigmentation, deeply plumps, and locks in long-lasting hydration.',
      howToUse: 'After cleansing and toning, apply a small amount on your entire face. Gently pat using fingertips to aid absorption.',
      countryOfOrigin: 'South Korea',
      isBestSeller: true,
      isFeatured: true,
      averageRating: 5.0,
      reviewCount: 310,
      badge: 'K-Beauty Cult',
      image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=800&auto=format&fit=crop',
      skinTypes: ['normal', 'dry', 'oily', 'combination', 'sensitive'],
      skinConcerns: ['dryness', 'aging', 'dullness', 'redness'],
    },
    {
      name: 'Beauty of Joseon Relief Sun : Rice + Probiotics (SPF50+ PA++++)',
      slug: 'beauty-of-joseon-relief-sun-rice-probiotics',
      brandSlug: 'beauty-of-joseon',
      categorySlug: 'sunscreen',
      price: 1450,
      compareAtPrice: 1700,
      sku: 'BOJ-RS-50',
      stock: 55,
      gender: 'UNISEX',
      description: 'Organic sunscreen with a lightweight and creamy lotion texture. Formulated with 30% Rice Extract and Grain Fermented Extracts to nourish and protect without any white cast or stickiness.',
      shortDescription: 'No white cast, lightweight chemical sunscreen with SPF50+ PA++++.',
      ingredients: 'Water, Oryza Sativa (Rice) Extract (30%), Dibutyl Adipate, Propanediol, Diethylamino Hydroxybenzoyl Hexyl Benzoate, Niacinamide, Lactobacillus/Rice Ferment.',
      benefits: 'Zero white cast, non-comedogenic, absorbs like a hydrating moisturizer with highest broad spectrum protection.',
      howToUse: 'Evenly spread a generous amount over areas vulnerable to sun exposure as the last step of morning skincare.',
      countryOfOrigin: 'South Korea',
      isBestSeller: true,
      isFeatured: true,
      averageRating: 4.9,
      reviewCount: 184,
      badge: 'SPF 50+ Top Pick',
      image: 'https://images.unsplash.com/photo-1556228722-d9b3be373b98?q=80&w=800&auto=format&fit=crop',
      skinTypes: ['normal', 'dry', 'combination', 'sensitive'],
      skinConcerns: ['dark-spots', 'aging', 'dryness'],
    },
    {
      name: 'Cetaphil Gentle Skin Cleanser',
      slug: 'cetaphil-gentle-skin-cleanser',
      brandSlug: 'cetaphil',
      categorySlug: 'cleansers',
      price: 1200,
      compareAtPrice: 1350,
      sku: 'CTP-GSC-250',
      stock: 35,
      gender: 'UNISEX',
      description: 'Creamy, non-foaming formula with Niacinamide, Panthenol, and hydrating Glycerin to preserve the skin moisture barrier during cleansing.',
      shortDescription: 'Hydrating non-foaming cleanser for sensitive & dry skin.',
      ingredients: 'Water, Glycerin, Cetearyl Alcohol, Panthenol, Niacinamide, Sodium Cocoyl Isethionate, Xanthan Gum.',
      benefits: 'Hypoallergenic, fragrance-free, soap-free formula trusted by dermatologists for over 70 years.',
      howToUse: 'Apply cleanser with or without water. Gently massage over face and wipe off with soft cloth or rinse with water.',
      countryOfOrigin: 'Canada',
      isBestSeller: false,
      isFeatured: true,
      averageRating: 4.8,
      reviewCount: 92,
      badge: 'Derm Recommended',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop',
      skinTypes: ['dry', 'sensitive', 'normal'],
      skinConcerns: ['dryness', 'redness'],
    },
    {
      name: 'La Roche-Posay Effaclar Duo+ M Anti-Imperfections',
      slug: 'la-roche-posay-effaclar-duo-plus',
      brandSlug: 'la-roche-posay',
      categorySlug: 'moisturizers',
      price: 1850,
      compareAtPrice: 2100,
      sku: 'LRP-ED-40',
      stock: 28,
      gender: 'UNISEX',
      description: 'Triple-action acne treatment that targets blemishes, blackheads, and post-acne dark marks with Phylobioma active, Salicylic acid, and Niacinamide.',
      shortDescription: 'Targeted breakout clearing gel-cream with anti-mark efficacy.',
      ingredients: 'Aqua / Water, Glycerin, Dimethicone, Isocetyl Stearate, Niacinamide, Isopropyl Lauroyl Sarcosinate, Silica, Ammonium Polyacryloyldimethyl Taurate, Salicylic Acid.',
      benefits: 'Visible results in 8 hours. Prevents acne recurrence and fades stubborn dark marks.',
      howToUse: 'Take a hazelnut-sized amount and warm it in hands. Gently apply to entire face after cleansing.',
      countryOfOrigin: 'France',
      isBestSeller: true,
      isFeatured: true,
      averageRating: 4.8,
      reviewCount: 115,
      badge: 'French Pharmacy',
      image: 'https://images.unsplash.com/photo-1608248597359-00976156e520?q=80&w=800&auto=format&fit=crop',
      skinTypes: ['oily', 'combination'],
      skinConcerns: ['acne', 'dark-spots'],
    },
    {
      name: 'CeraVe PM Facial Moisturizing Lotion',
      slug: 'cerave-pm-facial-moisturizing-lotion',
      brandSlug: 'cerave',
      categorySlug: 'moisturizers',
      price: 1550,
      compareAtPrice: 1750,
      sku: 'CRV-PM-89',
      stock: 42,
      gender: 'UNISEX',
      description: 'Ultra-lightweight nighttime moisturizer with MVE delivery technology for continuous 24-hour hydration. Enriched with 3 essential ceramides, hyaluronic acid, and niacinamide.',
      shortDescription: 'Night barrier repair lotion with ceramides & niacinamide.',
      ingredients: 'Aqua / Water / Eau, Glycerin, Caprylic/Capric Triglyceride, Niacinamide, Cetearyl Alcohol, Ceramide NP, Ceramide AP, Ceramide EOP, Hyaluronic Acid.',
      benefits: 'Oil-free and non-comedogenic. Restores the protective skin barrier overnight.',
      howToUse: 'Apply generously to face and neck at night, or as directed by a physician.',
      countryOfOrigin: 'USA',
      isBestSeller: true,
      isFeatured: true,
      averageRating: 4.9,
      reviewCount: 142,
      badge: 'Top Rated',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop',
      skinTypes: ['normal', 'dry', 'oily', 'combination', 'sensitive'],
      skinConcerns: ['dryness', 'dullness'],
    },
    {
      name: 'Minimalist Salicylic Acid 2% Serum',
      slug: 'minimalist-salicylic-acid-2-serum',
      brandSlug: 'minimalist',
      categorySlug: 'serums',
      price: 950,
      compareAtPrice: 1100,
      sku: 'MIN-SA-30',
      stock: 65,
      gender: 'UNISEX',
      description: 'Formulated with pure high-grade Salicylic Acid (BHA) that penetrates deep into sebum-filled pores to dissolve blackheads and prevent acne.',
      shortDescription: 'BHA exfoliant for blackheads and clogged pores.',
      ingredients: 'Aloe Barbadensis Leaf Juice, Dimethyl Isosorbide, Propylene Glycol, Salicylic Acid 2%, Zinc PCA, Sodium Hyaluronate.',
      benefits: 'Clears out whiteheads, minimizes enlarged pores, and balances excess oiliness.',
      howToUse: 'Apply 2-3 drops in evening routine 2-3 times weekly. Follow with a gentle moisturizer.',
      countryOfOrigin: 'India',
      isBestSeller: false,
      isFeatured: true,
      averageRating: 4.7,
      reviewCount: 78,
      badge: 'BHA Active',
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop',
      skinTypes: ['oily', 'combination'],
      skinConcerns: ['acne'],
    },
    {
      name: 'The Ordinary Glycolic Acid 7% Toning Solution',
      slug: 'the-ordinary-glycolic-acid-7-toner',
      brandSlug: 'the-ordinary',
      categorySlug: 'toners',
      price: 1550,
      compareAtPrice: 1800,
      sku: 'ORD-GA-240',
      stock: 38,
      gender: 'UNISEX',
      description: 'An exfoliating toner with 7% Glycolic Acid, Tasmanian Pepperberry, and Aloe Vera to boost skin clarity, visibly smooth texture, and promote radiant tone.',
      shortDescription: 'AHA exfoliating toner for glass-skin texture & glow.',
      ingredients: 'Aqua (Water), Glycolic Acid, Rosa Damascena Flower Water, Aloe Barbadensis Leaf Water, Panax Ginseng Root Extract, Tasmannia Lanceolata Fruit/Leaf Extract.',
      benefits: 'Gently loosens dead skin cells, boosts radiance, and smooths uneven skin tone.',
      howToUse: 'Use ideally in the PM, no more frequently than once daily. Saturate a cotton pad and sweep across face and neck.',
      countryOfOrigin: 'Canada',
      isBestSeller: true,
      isFeatured: true,
      averageRating: 4.8,
      reviewCount: 167,
      badge: 'Cult Exfoliant',
      image: 'https://images.unsplash.com/photo-1608248597359-00976156e520?q=80&w=800&auto=format&fit=crop',
      skinTypes: ['normal', 'dry', 'oily', 'combination'],
      skinConcerns: ['dark-spots', 'dullness', 'aging'],
    },
    {
      name: 'CeraVe Resurfacing Retinol Serum',
      slug: 'cerave-resurfacing-retinol-serum',
      brandSlug: 'cerave',
      categorySlug: 'serums',
      price: 1850,
      compareAtPrice: 2150,
      sku: 'CRV-RR-30',
      stock: 25,
      gender: 'UNISEX',
      description: 'Encapsulated retinol serum with licorice root extract and 3 essential ceramides. Reduces the appearance of post-acne marks and pores without compromising skin comfort.',
      shortDescription: 'Gentle encapsulated retinol for smooth refined skin.',
      ingredients: 'Aqua / Water / Eau, Propanediol, Dimethicone, Cetearyl Ethylhexanoate, Niacinamide, Retinol, Ceramide NP, Ceramide AP, Ceramide EOP, Dipotassium Glycyrrhizate.',
      benefits: 'Refines skin texture, fades post-blemish dark marks, and protects the skin barrier.',
      howToUse: 'Apply evenly to face daily in PM. If discomfort occurs during first application, space out applications until skin adjusts.',
      countryOfOrigin: 'USA',
      isBestSeller: true,
      isFeatured: true,
      averageRating: 4.9,
      reviewCount: 98,
      badge: 'Anti-Aging',
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop',
      skinTypes: ['normal', 'oily', 'combination'],
      skinConcerns: ['aging', 'dark-spots', 'acne'],
    },
    {
      name: 'Neutrogena Hydro Boost Water Gel',
      slug: 'neutrogena-hydro-boost-water-gel',
      brandSlug: 'neutrogena',
      categorySlug: 'moisturizers',
      price: 1400,
      compareAtPrice: 1600,
      sku: 'NTG-HB-50',
      stock: 48,
      gender: 'UNISEX',
      description: 'Unique oil-free water gel moisturizer that absorbs instantly like a gel with the long-lasting moisturizing power of a cream. Quenches dry skin with purified hyaluronic acid.',
      shortDescription: 'Oil-free hyaluronic acid instant hydration water gel.',
      ingredients: 'Water, Dimethicone, Glycerin, Dimethicone/Vinyl Dimethicone Crosspolymer, Phenoxyethanol, Sodium Hyaluronate.',
      benefits: 'Instantly increases skin hydration level and locks it in all day without greasiness.',
      howToUse: 'Apply evenly to face and neck after cleansing. Suitable under makeup.',
      countryOfOrigin: 'USA',
      isBestSeller: true,
      isFeatured: true,
      averageRating: 4.7,
      reviewCount: 140,
      badge: 'Hydration Star',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop',
      skinTypes: ['oily', 'combination', 'normal', 'dry'],
      skinConcerns: ['dryness', 'dullness'],
    },
    // MEN SKINCARE
    {
      name: 'CeraVe Hydrating Facial Cleanser for Men',
      slug: 'cerave-hydrating-facial-cleanser-men',
      brandSlug: 'cerave',
      categorySlug: 'men',
      price: 1350,
      compareAtPrice: 1500,
      sku: 'CRV-MEN-FC-236',
      stock: 30,
      gender: 'MEN',
      description: 'Formulated for men daily grooming, beard care, and sensitive post-shave skin. Cleanses and refreshes without stripping moisture or creating razor burn.',
      shortDescription: 'Non-stripping hydrating cleanser designed for men.',
      ingredients: 'Aqua / Water, Glycerin, Cetearyl Alcohol, PEG-40 Stearate, Ceramide NP, Ceramide AP, Ceramide EOP, Hyaluronic Acid.',
      benefits: 'Calms razor burn, softens facial hair, and fortifies natural moisture barrier.',
      howToUse: 'Massage gently into wet face and beard area morning and night. Rinse thoroughly.',
      countryOfOrigin: 'USA',
      isBestSeller: true,
      isFeatured: true,
      averageRating: 4.8,
      reviewCount: 82,
      badge: 'Men Grooming',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop',
      skinTypes: ['normal', 'dry', 'sensitive'],
      skinConcerns: ['dryness', 'redness'],
    },
    {
      name: 'Minimalist Multi-Peptide Serum for Anti-Aging',
      slug: 'minimalist-multi-peptide-serum',
      brandSlug: 'minimalist',
      categorySlug: 'serums',
      price: 1350,
      compareAtPrice: 1550,
      sku: 'MIN-MP-30',
      stock: 22,
      gender: 'UNISEX',
      description: 'Collagen boosting 7% Matrixyl 3000 + 3% Bio-Placenta peptide serum that stimulates repair and firms youthful elasticity.',
      shortDescription: 'Matrixyl 3000 multi-peptide firming anti-aging serum.',
      ingredients: 'Aqua, Glycerin, Butylene Glycol, Palmitoyl Tripeptide-1, Palmitoyl Tetrapeptide-7, Sodium Hyaluronate.',
      benefits: 'Significantly reduces depth of wrinkles and enhances firmness.',
      howToUse: 'Apply 2-3 drops to cleansed skin in AM and PM before moisturizers.',
      countryOfOrigin: 'India',
      isBestSeller: false,
      isFeatured: false,
      averageRating: 4.6,
      reviewCount: 45,
      badge: 'Collagen Boost',
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop',
      skinTypes: ['normal', 'dry', 'combination'],
      skinConcerns: ['aging'],
    },
  ];

  for (const p of productsData) {
    const brandId = brandMap.get(p.brandSlug);
    const categoryId = categoryMap.get(p.categorySlug);

    if (!brandId || !categoryId) continue;

    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        brandId,
        categoryId,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        sku: p.sku,
        stock: p.stock,
        gender: p.gender,
        description: p.description,
        shortDescription: p.shortDescription,
        ingredients: p.ingredients,
        benefits: p.benefits,
        howToUse: p.howToUse,
        countryOfOrigin: p.countryOfOrigin,
        isBestSeller: p.isBestSeller,
        isFeatured: p.isFeatured,
        averageRating: p.averageRating,
        reviewCount: p.reviewCount,
        badge: p.badge,
        status: 'ACTIVE',
        images: {
          create: [
            { url: p.image, altText: p.name, isPrimary: true, sortOrder: 0 },
            { url: p.image, altText: `${p.name} detail view`, isPrimary: false, sortOrder: 1 },
          ],
        },
        skinTypes: {
          create: p.skinTypes
            .map((st) => ({ skinTypeId: skinTypeMap.get(st)! }))
            .filter((x) => x.skinTypeId),
        },
        skinConcerns: {
          create: p.skinConcerns
            .map((sc) => ({ skinConcernId: skinConcernMap.get(sc)! }))
            .filter((x) => x.skinConcernId),
        },
      },
    });
  }

  console.log(`📦 Seeded ${productsData.length} authentic skincare products`);

  // 7. Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: 'WELCOME10',
        type: 'PERCENTAGE',
        value: 10,
        minOrderAmount: 1000,
        maxDiscountAmount: 300,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        code: 'FREESHIP',
        type: 'FREE_DELIVERY',
        value: 0,
        minOrderAmount: 1500,
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        code: 'SKIN300',
        type: 'FIXED',
        value: 300,
        minOrderAmount: 2500,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    ],
  });

  // 8. Featured Reviews (matching homepage design)
  const firstProduct = await prisma.product.findFirst();
  if (firstProduct) {
    await prisma.review.createMany({
      data: [
        {
          productId: firstProduct.id,
          userId: demoCustomer.id,
          userName: 'Ayesha Rahman',
          userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
          rating: 5,
          title: '100% Authentic and Gentle',
          comment: 'Really loved the product! It feels 100% authentic and worked miracles for my acne-prone combination skin within 2 weeks.',
          isVerifiedPurchase: true,
          status: 'APPROVED',
          isFeatured: true,
        },
        {
          productId: firstProduct.id,
          userId: demoCustomer.id,
          userName: 'Rafi Ahmed',
          userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
          rating: 5,
          title: 'Best Skincare Store in BD',
          comment: 'Finally a trustworthy platform in Bangladesh where you don’t have to worry about counterfeit products. Fast delivery in Dhaka too!',
          isVerifiedPurchase: true,
          status: 'APPROVED',
          isFeatured: true,
        },
        {
          productId: firstProduct.id,
          userId: demoCustomer.id,
          userName: 'Farhana Islam',
          userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
          rating: 5,
          title: 'Skin guide helped me pick right',
          comment: 'The skin quiz matched me with the exact cleanser and serum I needed. No sticky feel, glowing results.',
          isVerifiedPurchase: true,
          status: 'APPROVED',
          isFeatured: true,
        },
      ],
    });
  }

  // 8. Banners with High-Quality Skincare Imagery
  await prisma.banner.createMany({
    data: [
      {
        title: 'Original Skincare for Real Skin',
        subtitle: '100% authentic dermatological solutions delivered across Bangladesh.',
        imageUrl: 'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?q=80&w=1600&auto=format&fit=crop',
        linkUrl: '/shop',
        buttonText: 'Explore Collection',
        position: 'HERO',
        isActive: true,
        sortOrder: 1,
      },
      {
        title: 'Korean Glass Skin Routine',
        subtitle: 'Hydrating snail mucin, soothing centella, and antioxidant serums.',
        imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1600&auto=format&fit=crop',
        linkUrl: '/shop?category=serums',
        buttonText: 'Shop Serums',
        position: 'HERO',
        isActive: true,
        sortOrder: 2,
      },
      {
        title: 'Summer Sun Protection Fest',
        subtitle: 'UVA/UVB SPF 50+ broad-spectrum shields with zero greasy residue.',
        imageUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=1600&auto=format&fit=crop',
        linkUrl: '/shop?category=sunscreen',
        buttonText: 'Find Your SPF',
        position: 'PROMO',
        isActive: true,
        sortOrder: 3,
      },
    ] as any,
  });

  // 9. Homepage CMS Sections
  const cmsSections = [
    {
      sectionKey: 'hero',
      title: 'Original Skincare for Real Skin',
      subtitle: 'Trusted brands. 100% authentic.',
      buttonText: 'Shop Men,Shop Women',
      imageUrl: 'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?q=80&w=1400&auto=format&fit=crop',
      isActive: true,
      sortOrder: 1,
    },
    {
      sectionKey: 'category_cards',
      title: 'Category Discovery',
      subtitle: 'Find targeted solutions tailored for your unique skin.',
      isActive: true,
      sortOrder: 2,
    },
    {
      sectionKey: 'best_sellers',
      title: 'Best Sellers',
      subtitle: 'Loved by thousands of skincare enthusiasts across Bangladesh.',
      isActive: true,
      sortOrder: 3,
    },
    {
      sectionKey: 'why_choose_us',
      title: 'Why Choose Us',
      subtitle: 'Your peace of mind is our highest priority.',
      isActive: true,
      sortOrder: 4,
    },
    {
      sectionKey: 'reviews',
      title: 'Customer Reviews',
      subtitle: 'Real stories from verified customers across Bangladesh.',
      isActive: true,
      sortOrder: 5,
    },
  ];

  for (const s of cmsSections) {
    await prisma.homepageSection.create({ data: s });
  }

  // 10. Skin Quiz Questions
  const q1 = await prisma.skinQuizQuestion.create({
    data: {
      question: 'How does your skin feel midday?',
      subtitle: 'Let us understand your primary skin type.',
      category: 'SKIN_TYPE',
      sortOrder: 1,
      options: {
        create: [
          { optionText: 'Shiny all over with noticeable oil', valueKey: 'oily', sortOrder: 1 },
          { optionText: 'Tight, flaky, or rough', valueKey: 'dry', sortOrder: 2 },
          { optionText: 'Oily along T-zone (forehead & nose), normal cheeks', valueKey: 'combination', sortOrder: 3 },
          { optionText: 'Comfortable, neither oily nor dry', valueKey: 'normal', sortOrder: 4 },
          { optionText: 'Red, itchy, or easily irritated', valueKey: 'sensitive', sortOrder: 5 },
        ],
      },
    },
  });

  const q2 = await prisma.skinQuizQuestion.create({
    data: {
      question: 'What is your top skin goal or concern?',
      subtitle: 'We will select active ingredients tailored to target this.',
      category: 'MAIN_CONCERN',
      sortOrder: 2,
      options: {
        create: [
          { optionText: 'Clear acne, pimples, and blackheads', valueKey: 'acne', sortOrder: 1 },
          { optionText: 'Fade dark spots and sun pigmentation', valueKey: 'dark-spots', sortOrder: 2 },
          { optionText: 'Deep hydration and barrier repair', valueKey: 'dryness', sortOrder: 3 },
          { optionText: 'Anti-aging, fine lines, and firming', valueKey: 'aging', sortOrder: 4 },
          { optionText: 'Brighten dullness for an instant glow', valueKey: 'dullness', sortOrder: 5 },
        ],
      },
    },
  });

  const q3 = await prisma.skinQuizQuestion.create({
    data: {
      question: 'How does your skin react to new products?',
      subtitle: 'This helps us adjust the strength of active formulations.',
      category: 'SENSITIVITY',
      sortOrder: 3,
      options: {
        create: [
          { optionText: 'Rarely gets irritated (Low sensitivity)', valueKey: 'LOW', sortOrder: 1 },
          { optionText: 'Sometimes experiences tingling or redness (Medium)', valueKey: 'MEDIUM', sortOrder: 2 },
          { optionText: 'Very sensitive, breaks out or burns easily (High)', valueKey: 'HIGH', sortOrder: 3 },
        ],
      },
    },
  });

  // 11. Sample Order for Admin KPI demonstration
  const orderedProduct: any = await prisma.product.findFirst({ include: { images: true } });

  if (orderedProduct) {
    const sampleOrder = await prisma.order.create({
      data: {
        orderNumber: 'SKN10245',
        userId: demoCustomer.id,
        customerName: 'Ayesha Rahman',
        customerPhone: '+8801712345678',
        customerEmail: 'customer@example.com',
        division: 'Dhaka',
        district: 'dhaka-city',
        area: 'Gulshan-2',
        fullAddress: 'House 42, Road 11, Block D, Gulshan-2, Dhaka',
        postalCode: '1212',
        deliveryMethod: 'STANDARD',
        paymentMethod: 'COD',
        paymentStatus: 'PAID',
        orderStatus: 'DELIVERED',
        subtotal: 2500,
        discount: 100,
        shippingFee: 60,
        totalAmount: 2460,
        trackingNumber: 'STDF-849204',
        courierName: 'Steadfast Courier',
        items: {
          create: [
            {
              productId: orderedProduct.id,
              productName: orderedProduct.name,
              productSku: orderedProduct.sku,
              productImage: orderedProduct.images?.[0]?.url || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop',
              price: orderedProduct.price,
              quantity: 2,
              subtotal: orderedProduct.price * 2,
            },
          ],
        },
        timeline: {
          create: [
            { status: 'PENDING', note: 'Order placed by customer' },
            { status: 'CONFIRMED', note: 'Order confirmed by store' },
            { status: 'PROCESSING', note: 'Order packed in warehouse' },
            { status: 'SHIPPED', note: 'Handed over to Steadfast Courier (Tracking: STDF-849204)' },
            { status: 'DELIVERED', note: 'Package delivered and cash collected' },
          ],
        },
        payments: {
          create: {
            amount: 2460,
            paymentMethod: 'COD',
            transactionId: 'COD-SKN10245',
            status: 'PAID',
          },
        },
      },
    });
  }

  console.log('✅ Seeding complete! Database is ready.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
