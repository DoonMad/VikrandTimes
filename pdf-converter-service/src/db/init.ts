import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL environment variable is missing!");
  process.exit(1);
}

export async function initializeDatabase() {
  console.log("⚙️ Starting database schema auto-initialization...");
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log("🔌 Connected to PostgreSQL database.");

    // 1. Add page_count to editions if missing
    await client.query(`
      ALTER TABLE editions ADD COLUMN IF NOT EXISTS page_count INTEGER DEFAULT 1;
    `);
    console.log("✅ Verified column 'page_count' on table 'editions'.");

    // 2. Add page_count to special_editions if missing
    await client.query(`
      ALTER TABLE special_editions ADD COLUMN IF NOT EXISTS page_count INTEGER DEFAULT 1;
    `);
    console.log("✅ Verified column 'page_count' on table 'special_editions'.");

    // 3. Create metrics table if missing
    await client.query(`
      CREATE TABLE IF NOT EXISTS metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        target_id TEXT NOT NULL,
        original_size_bytes BIGINT NOT NULL,
        compressed_size_bytes BIGINT NOT NULL,
        conversion_time_ms INTEGER NOT NULL,
        page_count INTEGER NOT NULL,
        client_load_time_ms INTEGER,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("✅ Verified table 'metrics' exists.");

    // 4. Enable RLS on metrics
    await client.query(`
      ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
    `);
    console.log("✅ Enabled Row Level Security (RLS) on 'metrics' table.");

    // 5. Create insert policy for public (try-catch because CREATE POLICY fails if it exists)
    try {
      await client.query(`
        CREATE POLICY "Anyone can insert metrics" 
        ON metrics 
        FOR INSERT 
        TO anon, authenticated 
        WITH CHECK (true);
      `);
      console.log("✅ Created INSERT policy on 'metrics' table.");
    } catch (policyErr: any) {
      if (policyErr.code === "42710") {
        console.log("ℹ️ INSERT policy on 'metrics' table already exists. Skipping.");
      } else {
        throw policyErr;
      }
    }

    // 6. Create select policy for admins (try-catch)
    try {
      await client.query(`
        CREATE POLICY "Only admins can view metrics" 
        ON metrics 
        FOR SELECT 
        TO authenticated 
        USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
              AND profiles.role = 'admin'
          )
        );
      `);
      console.log("✅ Created SELECT policy on 'metrics' table.");
    } catch (policyErr: any) {
      if (policyErr.code === "42710") {
        console.log("ℹ️ SELECT policy on 'metrics' table already exists. Skipping.");
      } else {
        throw policyErr;
      }
    }

    console.log("🚀 Database schema auto-initialization complete!");
  } catch (err) {
    console.error("❌ Database initialization failed:", err);
    throw err;
  } finally {
    await client.end();
  }
}
