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

const fileEnv = parseEnv(envPath);
const env = { ...fileEnv, ...process.env };

const runtime = {
  SUPABASE_URL: env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: env.SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY || ''
};

const missing = Object.entries(runtime)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missing.length > 0) {
  console.warn(`Warning: missing values for ${missing.join(', ')}.`);
}

const content = `window.LIGHTSOUT_ENV = ${JSON.stringify(runtime, null, 2)};\n`;
fs.writeFileSync(outputPath, content, 'utf8');
console.log(`Generated runtime config at ${path.relative(rootDir, outputPath)}`);