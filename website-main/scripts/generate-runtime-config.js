const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env');
const outputPath = path.join(rootDir, 'js', 'runtime-config.js');

function parseEnv(filePath) {
  const file = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  const env = {};

  for (const line of file.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    env[key] = value.replace(/^['"]|['"]$/g, '');
  }

  return env;
}

// Merge local .env (for dev) with process.env (for Vercel/hosting platforms).
// process.env takes priority so real deployment values always win.
const fileEnv = parseEnv(envPath);
const env = { ...fileEnv, ...process.env };

const runtime = {
  SUPABASE_URL: env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: env.SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY || ''
};

if (!runtime.SUPABASE_URL || !runtime.SUPABASE_ANON_KEY) {
  console.warn('Warning: SUPABASE_URL or SUPABASE_ANON_KEY/SUPABASE_PUBLISHABLE_KEY is missing. ' +
    'Check your .env file (local) or your platform\'s Environment Variables settings (production).');
}

const content = `window.LIGHTSOUT_ENV = ${JSON.stringify(runtime, null, 2)};\n`;
fs.writeFileSync(outputPath, content, 'utf8');
console.log(`Generated runtime config at ${path.relative(rootDir, outputPath)}`);