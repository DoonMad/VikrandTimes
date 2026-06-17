import { createClient } from "@supabase/supabase-js";
import { addPdfJob } from "../queue";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function runMigration() {
  console.log("🔍 Checking database for unconverted legacy editions...");

  try {
    // 1. Fetch normal editions with page_count = 1 (our default value for unconverted editions)
    const { data: normalEditions, error: normalErr } = await supabase
      .from("editions")
      .select("publish_date, page_count")
      .order("publish_date", { ascending: false });

    if (normalErr) {
      throw normalErr;
    }

    console.log(`📋 Found ${normalEditions?.length || 0} normal editions to convert.`);

    // 2. Fetch special editions with page_count = 1
    const { data: specialEditions, error: specialErr } = await supabase
      .from("special_editions")
      .select("slug, title, publish_date, page_count")
      .order("publish_date", { ascending: false });

    if (specialErr) {
      throw specialErr;
    }

    console.log(`📋 Found ${specialEditions?.length || 0} special editions to convert.`);

    let enqueuedCount = 0;

    // 3. Queue normal editions
    if (normalEditions && normalEditions.length > 0) {
      for (const edition of normalEditions) {
        const jobId = `migrate-edition-${edition.publish_date}`;
        console.log(`➕ Enqueuing migration for edition: ${edition.publish_date}`);

        await addPdfJob(jobId, {
          pdfPath: "", // Will be downloaded by the worker from storage
          publishDate: edition.publish_date,
          isSpecial: false,
          isMigration: true,
        });
        enqueuedCount++;
      }
    }

    // 4. Queue special editions
    if (specialEditions && specialEditions.length > 0) {
      for (const edition of specialEditions) {
        const jobId = `migrate-special-${edition.slug}`;
        console.log(`➕ Enqueuing migration for special edition: ${edition.title} (${edition.slug})`);

        await addPdfJob(jobId, {
          pdfPath: "", // Will be downloaded by the worker from storage
          slug: edition.slug,
          title: edition.title,
          publishDate: edition.publish_date,
          isSpecial: true,
          isMigration: true,
        });
        enqueuedCount++;
      }
    }

    console.log(`\n🎉 Successfully enqueued ${enqueuedCount} legacy editions for WebP conversion!`);
    console.log("💡 Make sure the dedicated backend server is running so the BullMQ Worker processes these jobs.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration enqueuing failed:", err);
    process.exit(1);
  }
}

runMigration();
