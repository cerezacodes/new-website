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

const env = parseEnv(envPath);
const runtime = {
  SUPABASE_URL: env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY || '',
  ADMIN_PASSWORD: env.ADMIN_PASSWORD || '',
  WRITER_PASSWORD: env.WRITER_PASSWORD || ''
};

const content = `window.LIGHTSOUT_ENV = ${JSON.stringify(runtime, null, 2)};\n`;
fs.writeFileSync(outputPath, content, 'utf8');
console.log(`Generated runtime config at ${path.relative(rootDir, outputPath)}`);
