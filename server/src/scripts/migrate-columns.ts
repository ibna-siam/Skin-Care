import pg from 'pg';
import 'dotenv/config';

async function run() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('No DATABASE_URL found.');
    process.exit(1);
  }

  const pool = new pg.Pool({ connectionString });
  const client = await pool.connect();

  try {
    console.log('Starting safe non-destructive migration...');

    // 1. User table additions
    await client.query(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetPasswordToken" TEXT;
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetPasswordExpires" TIMESTAMP(3);
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "authProvider" TEXT NOT NULL DEFAULT 'LOCAL';
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "googleId" TEXT;
    `);
    console.log('User columns migrated successfully.');

    // 2. Add unique index for googleId safely
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "User_googleId_key" ON "User"("googleId");
    `);
    console.log('User googleId index created.');

    // 3. MediaAsset table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "MediaAsset" (
        "id" TEXT NOT NULL,
        "title" TEXT,
        "url" TEXT NOT NULL,
        "storageKey" TEXT,
        "section" TEXT NOT NULL DEFAULT 'GENERAL',
        "slot" TEXT,
        "altText" TEXT,
        "fileType" TEXT,
        "fileSize" INTEGER,
        "width" INTEGER,
        "height" INTEGER,
        "isSystem" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
      );

      CREATE INDEX IF NOT EXISTS "MediaAsset_section_idx" ON "MediaAsset"("section");
      CREATE INDEX IF NOT EXISTS "MediaAsset_slot_idx" ON "MediaAsset"("slot");
      CREATE INDEX IF NOT EXISTS "MediaAsset_createdAt_idx" ON "MediaAsset"("createdAt");
    `);
    console.log('MediaAsset table and indexes created successfully.');

    // 4. Verify admin user exists or role
    const res = await client.query(`SELECT id, email, role FROM "User" LIMIT 5;`);
    console.log('Sample users in database:', res.rows);

    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
