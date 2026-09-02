# Deployment

The browser needs `js/runtime-config.js` before any page initializes Supabase.
The deployment build generates that file from environment variables.

## Build command

```text
npm run build
```

Set these variables in the hosting provider's environment settings before the build:

```text
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Do not commit `.env`, `SUPABASE_SECRET_KEY`, or any service-role/secret key. Secret
keys belong only in server-side functions and must never be passed to the browser.

## Static hosting

For Netlify, Vercel, or another static host, use `npm run build` as the build
command and publish the project directory containing the generated `js` folder.
The generated runtime file is ignored by git, so the host must run the build on
every deployment.