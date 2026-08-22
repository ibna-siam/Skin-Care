import { prisma } from '../config/db.js';

async function migrateNewTables() {
  console.log('--- Running Non-Destructive Database Migration for Advanced Features ---');
  try {
    // 1. Create BlockedIP table if not exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "BlockedIP" (
        "id" TEXT PRIMARY KEY,
        "ipAddress" TEXT NOT NULL,
        "reason" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "hitCount" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('BlockedIP table verified/created.');

    // 2. Add indexes on BlockedIP
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "BlockedIP_ipAddress_key" ON "BlockedIP"("ipAddress");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "BlockedIP_isActive_idx" ON "BlockedIP"("isActive");
    `);
    console.log('BlockedIP indexes created.');

    // 3. Alter Shipment table safely
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Shipment" ADD COLUMN IF NOT EXISTS "consignmentId" TEXT;
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Shipment" ADD COLUMN IF NOT EXISTS "courierFee" DOUBLE PRECISION;
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Shipment" ADD COLUMN IF NOT EXISTS "rawResponse" TEXT;
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Shipment_consignmentId_key" ON "Shipment"("consignmentId");
    `);
    console.log('Shipment table columns and index verified.');

    // 4. Seed default StoreSettings if not populated
    const defaultSettings = [
      { key: 'STORE_NAME', value: 'Skincare Bangladesh', group: 'GENERAL' },
      { key: 'STORE_LOGO_URL', value: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400', group: 'GENERAL' },
      { key: 'SUPPORT_EMAIL', value: 'support@skincare.com.bd', group: 'GENERAL' },
      { key: 'SUPPORT_PHONE', value: '+880 1711-223344', group: 'GENERAL' },
      { key: 'STORE_ADDRESS', value: 'House 42, Road 11, Banani, Dhaka-1213, Bangladesh', group: 'GENERAL' },
      { key: 'FACEBOOK_URL', value: 'https://facebook.com/skincarebd', group: 'GENERAL' },
      { key: 'INSTAGRAM_URL', value: 'https://instagram.com/skincarebd', group: 'GENERAL' },
      { key: 'WHATSAPP_NUMBER', value: '+8801711223344', group: 'GENERAL' },
      { key: 'FOOTER_TAGLINE', value: '100% Authentic Dermatological Skincare Formulated for Tropical Weather.', group: 'GENERAL' },
      { key: 'GA4_MEASUREMENT_ID', value: 'G-SKINCAREBD123', group: 'ANALYTICS' },
      { key: 'FB_PIXEL_ID', value: '987654321012345', group: 'ANALYTICS' },
      { key: 'STEADFAST_API_KEY', value: '', group: 'COURIER' },
      { key: 'STEADFAST_SECRET_KEY', value: '', group: 'COURIER' },
      { key: 'PATHAO_CLIENT_ID', value: '', group: 'COURIER' },
      { key: 'PATHAO_CLIENT_SECRET', value: '', group: 'COURIER' },
      { key: 'PATHAO_USERNAME', value: '', group: 'COURIER' },
      { key: 'PATHAO_PASSWORD', value: '', group: 'COURIER' },
      { key: 'SMS_PROVIDER', value: 'GREENWEB', group: 'SMS' },
      { key: 'SMS_API_KEY', value: '', group: 'SMS' },
      { key: 'SMS_SENDER_ID', value: 'SkinCare', group: 'SMS' },
    ];

    for (const setting of defaultSettings) {
      await prisma.storeSetting.upsert({
        where: { key: setting.key },
        update: {},
        create: setting,
      });
    }
    console.log('Default StoreSettings verified.');

    console.log('--- Migration completed successfully with ZERO data loss ---');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateNewTables();
