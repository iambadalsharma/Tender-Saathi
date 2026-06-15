# Cloudflare Publish Setup

Use this when you want Tender Saathi to run on Cloudflare with a new D1 database.

## 1. Create D1 Database

Run this locally after Cloudflare login, or run it anywhere with `CLOUDFLARE_API_TOKEN` set:

```bash
npx wrangler d1 create tender-saathi-db
```

Copy the returned `database_id`.

## 2. Add GitHub Secrets

Open GitHub repo settings for `iambadalsharma/Tender-Saathi`, then add:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_D1_DATABASE_ID`

The API token needs permission to deploy Workers and manage D1.

## 3. Deploy

Open GitHub Actions and run:

```text
Deploy to Cloudflare
```

The workflow will:

- install dependencies
- build the Vinext app
- apply `drizzle/0000_young_gladiator.sql` to D1
- deploy the Cloudflare Worker from `dist/server/wrangler.json`

## Current Database Binding

The app expects the D1 binding name:

```text
DB
```

`vite.config.ts` reads:

- `CLOUDFLARE_D1_DATABASE_NAME`, default `tender-saathi-db`
- `CLOUDFLARE_D1_DATABASE_ID`, default placeholder for local builds

## Auth Note

Cloudflare D1 stores tender/order/customer records. It does not provide customer login by itself. The current app still uses Supabase Auth for email/password and mobile OTP unless we separately build Cloudflare-native authentication.

