# Tender Saathi

A Sites-ready customer portal for:

- showing customers what tender and order work the service manages
- opening a login/sign up panel
- authenticating customers with Supabase email/password or mobile OTP
- showing a customer-wise tender and order dashboard
- switching the public site and dashboard between English and Hindi
- exporting dashboard data to Excel from the browser
- assigning a separate folder link to every tender
- surfacing growth analysis, alerts, team tasks, and competitor quote signals

## Stack

- `vinext` + Next.js app router
- Cloudflare Worker-compatible Sites output
- Supabase Auth and database setup for customer data
- Cloudflare D1 schema scaffolded in `db/schema.ts`
- Browser-side Excel export via `xlsx`

## Local commands

```bash
npm install
npm run dev
npm run build
npm run db:generate
```

## Current implementation

- `app/page.tsx` renders the dashboard
- `app/components/customer-portal.tsx` contains the customer-facing UI, English/Hindi toggle, public pages, auth drawer, dashboard, add-tender form, tables, folder view, analytics, alerts, and team board
- `lib/tender-data.ts` supplies seeded customer, tender, order, and table-column data
- API-readiness content and internal API routes have been removed for the current simple flow

## Current flow

- Public pages cover home, features, growth analysis, plans, and resources.
- English/Hindi language toggle is available in the upper corner and stays active after login.
- Login or sign up opens from the side drawer.
- Sign up creates a unique customer ID and authenticates through Supabase.
- Login supports email/password and mobile OTP.
- Dashboard shows live, upcoming, working, filed, and missed tender counts.
- Tenders can be added by tender number and optional PDF upload.
- Each tender gets a separate folder path.
- Orders show contract, BG, courier, and CRAC columns.
- Analysis shows pipeline value, fit score, quote gap, competitor signals, and recommended actions.
- Alerts and team views show due-date, BG, EMD, pre-bid, and task follow-up items.

## Supabase setup

This app is connected to Supabase project `https://qoebcbrbbdusczbcchse.supabase.co` using the publishable browser key in `lib/supabase.ts`.

To activate real customer storage:

1. Open Supabase dashboard.
2. Go to SQL Editor.
3. Run `supabase/schema.sql`.
4. Go to Authentication > Providers and keep Email enabled.
5. For mobile OTP, configure a phone/SMS provider in Supabase Auth. The UI already calls Supabase OTP, but SMS delivery will only work after provider setup.

The Supabase schema includes:

- `customers`
- `tenders`
- `orders`
- `files`

Row Level Security is enabled so logged-in customers can access only their own data.

## Cloudflare/D1 note

`.openai/hosting.json` still declares D1 as `DB` for future Cloudflare-native storage, but the active customer auth path is now Supabase.

For Cloudflare database and Worker deployment, see `CLOUDFLARE.md`.
