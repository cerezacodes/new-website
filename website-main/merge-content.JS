
const fs = require('fs');
const path = require('path');

const articleHtmlPath = process.argv[2];
const parsedJsonPath = process.argv[3];

if (!articleHtmlPath || !parsedJsonPath) {
  console.error('Usage: node merge_content.js path/to/article.html path/to/parsed_articles.json');
  process.exit(1);
}

const html = fs.readFileSync(articleHtmlPath, 'utf8');

// Locate the `const articles = { ... };` block. It ends right before the
// next top-level declaration in article.html, which is
// `function normalizeRuntimeConfig(`.
const startMarker = 'const articles = {';
const endMarker = 'function normalizeRuntimeConfig(';

const startIdx = html.indexOf(startMarker);
if (startIdx === -1) {
  console.error('Could not find "const articles = {" in the given file. Is this the right article.html?');
  process.exit(1);
}

const endIdx = html.indexOf(endMarker, startIdx);
if (endIdx === -1) {
  console.error('Could not find the end of the articles object (expected "function normalizeRuntimeConfig(" after it).');
  process.exit(1);
}

const objectSource = html.slice(startIdx, endIdx);

// Evaluate the real object literal (safe here: this is your own local file,
// not untrusted input, and we only ever read it, never send it anywhere).
let articles;
try {
  // eslint-disable-next-line no-new-func
  const factory = new Function(objectSource + '\nreturn articles;');
  articles = factory();
} catch (err) {
  console.error('Failed to evaluate the articles object. It may not be valid JS, or the end marker moved.');
  console.error(err.message);
  process.exit(1);
}

const articleIds = Object.keys(articles);
console.log(`Found ${articleIds.length} articles with full content in ${path.basename(articleHtmlPath)}.`);

// Load the list-page metadata (id, category, published_at, image, etc.)
const parsed = JSON.parse(fs.readFileSync(parsedJsonPath, 'utf8'));
console.log(`Loaded ${parsed.length} articles from ${path.basename(parsedJsonPath)}.`);

const merged = [];
const missingContent = [];

for (const item of parsed) {
  const full = articles[item.id];

  if (!full) {
    missingContent.push(item.id);
    merged.push(item); // keep the list-page metadata even without body content
    continue;
  }

  merged.push({
    ...item,
    title: full.title || item.title,
    subtitle: full.subtitle || item.subtitle,
    description: full.subtitle || item.subtitle,
    image: full.image || item.image,
    author_name: full.authorName || item.author_name,
    author_pic: full.authorPic || item.author_pic,
    content: full.content || '',
    // font is stored as e.g. "'Playfair Display', serif" in some entries
    font_family: full.font || undefined
  });
}

// Report any ids present in article.html's content object but absent
// from the articles.html card list (informational only — these won't be
// migrated since they have no card metadata like category/date).
const parsedIds = new Set(parsed.map((a) => a.id));
const contentOnlyIds = articleIds.filter((id) => !parsedIds.has(id));

fs.writeFileSync(
  path.join(path.dirname(parsedJsonPath), 'merged_articles.json'),
  JSON.stringify(merged, null, 2),
  'utf8'
);

console.log('\n--- Merge summary ---');
console.log(`Total articles written to merged_articles.json: ${merged.length}`);
console.log(`Articles that already had full content merged in: ${merged.length - missingContent.length}`);

if (missingContent.length > 0) {
  console.log(`\nWARNING: ${missingContent.length} article(s) had NO matching content in article.html (will migrate with empty content):`);
  missingContent.forEach((id) => console.log('  -', id));
}

if (contentOnlyIds.length > 0) {
  console.log(`\nNOTE: ${contentOnlyIds.length} article id(s) exist in article.html's content object but not in articles.html's card list (skipped, not in merged output):`);
  contentOnlyIds.forEach((id) => console.log('  -', id));
}

console.log('\nDone. Use merged_articles.json with migrate_to_supabase.js.');