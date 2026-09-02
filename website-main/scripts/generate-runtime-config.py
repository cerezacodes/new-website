from pathlib import Path

root = Path(__file__).resolve().parent.parent
env_path = root / '.env'
output_path = root / 'js' / 'runtime-config.js'

config = {
    'SUPABASE_URL': '',
    'SUPABASE_ANON_KEY': '',
    'ADMIN_PASSWORD': '',
    'WRITER_PASSWORD': ''
}

if env_path.exists():
    for line in env_path.read_text(encoding='utf-8').splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith('#') or '=' not in stripped:
            continue
        key, value = stripped.split('=', 1)
        key = key.strip()
        value = value.strip().strip('"\'')
        if key in config:
            config[key] = value

output_path.write_text(
    'window.LIGHTSOUT_ENV = ' + str({k: v for k, v in config.items() if v}).replace("'", '"') + ';\n',
    encoding='utf-8'
)

print(f'Generated runtime config at {output_path.relative_to(root)}')
