/**
 * One-time migration script.
 * Reads parsed_articles.json (the ~67 articles that were hardcoded directly
 * into articles.html) and inserts them into the Supabase "articles" table.
 *
 * USAGE:
 *   1. Place this file and parsed_articles.json in your project root
 *      (or anywhere — just keep them together).
 *   2. Run:  npm install @supabase/supabase-js   (if not already installed)
 *   3. Run:  node migrate_to_supabase.js
 *
 * This uses the SAME public URL + anon/publishable key your site already
 * uses client-side (read from your .env), because your "articles" table's
 * RLS policy already allows public inserts. No service-role key needed.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// ---- Load credentials from .env (same file your generate-runtime-config.js reads) ----
function parseEnv(filePath) {
  const file = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  const env = {};
  for (const line of file.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    env[key] = value;
  }
  return env;
}

const envPath = path.join(__dirname, '.env');
const env = { ...parseEnv(envPath), ...process.env };

const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY/SUPABASE_ANON_KEY.');
  console.error('Make sure a .env file with these values sits next to this script,');
  console.error('or set them as environment variables before running.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function migrate() {
  // Prefer merged_articles.json (full content, from merge_content.js) if present;
  // fall back to parsed_articles.json (list-page metadata only, empty content).
  const mergedPath = path.join(__dirname, 'merged_articles.json');
  const fallbackPath = path.join(__dirname, 'parsed_articles.json');
  const jsonPath = fs.existsSync(mergedPath) ? mergedPath : fallbackPath;

  console.log(`Reading articles from: ${path.basename(jsonPath)}`);
  const rawArticles = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  // font_family/font_size are NOT columns in the current "articles" table
  // schema (confirmed by the insert error), so strip them out entirely
  // rather than sending a column Supabase doesn't recognize.
  const articles = rawArticles.map(({ font_family, font_size, ...rest }) => rest);

  console.log(`Loaded ${articles.length} articles to migrate.`);

  // Check which ids already exist, so re-running this script is safe
  // (won't create duplicates if some articles were already migrated).
  const ids = articles.map((a) => a.id);
  const { data: existing, error: fetchError } = await supabase
    .from('articles')
    .select('id')
    .in('id', ids);

  if (fetchError) {
    console.error('Could not check existing articles:', fetchError.message);
    process.exit(1);
  }

  const existingIds = new Set((existing || []).map((row) => row.id));
  const toInsert = articles.filter((a) => !existingIds.has(a.id));
  const skipped = articles.length - toInsert.length;

  if (skipped > 0) {
    console.log(`Skipping ${skipped} article(s) already present in Supabase.`);
  }

  if (toInsert.length === 0) {
    console.log('Nothing new to migrate. All articles already exist in Supabase.');
    return;
  }

  console.log(`Inserting ${toInsert.length} new article(s)...`);

  // Insert in small batches to keep each request light and easy to debug.
  const BATCH_SIZE = 10;
  let successCount = 0;
  const failures = [];

  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const batch = toInsert.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('articles').insert(batch);

    if (error) {
      console.error(`Batch starting at index ${i} failed:`, error.message);
      failures.push(...batch.map((a) => a.id));
    } else {
      successCount += batch.length;
      console.log(`  Inserted batch ${i / BATCH_SIZE + 1} (${batch.length} articles) OK`);
    }
  }

  console.log('\n--- Migration summary ---');
  console.log(`Successfully inserted: ${successCount}`);
  console.log(`Already existed (skipped): ${skipped}`);
  console.log(`Failed: ${failures.length}`);
  if (failures.length > 0) {
    console.log('Failed article ids:', failures.join(', '));
  }
}

migrate().catch((err) => {
  console.error('Migration failed with an unexpected error:', err);
  process.exit(1);
});