# Seduktive Ent booking app

Static pages + Vercel serverless functions + Supabase Postgres.

- `/` customer page: create account (username + 4-digit PIN), log in, send booking requests, see own bookings
- `/admin.html` admin page: password login, all bookings, filter/search, change status, add notes

## Setup

### 1. Supabase
1. Create a project at supabase.com.
2. SQL Editor > New query > paste `supabase/schema.sql` > Run.
3. Project Settings > API: copy the **Project URL** and the **service_role** key (keep it secret).

### 2. GitHub
```
git init && git add . && git commit -m "Initial commit"
```
Create an empty repo on GitHub, then `git remote add origin <url> && git push -u origin main`.

### 3. Vercel
1. vercel.com > Add New > Project > import the GitHub repo. Framework preset: **Other**.
2. Add environment variables (see `.env.example`):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SESSION_SECRET` (random, 32+ chars, e.g. `openssl rand -hex 32`)
   - `ADMIN_PASSWORD` (long passphrase)
3. Deploy. Visit `/` and `/admin.html`.

### Local testing
`npm i -g vercel`, copy `.env.example` to `.env.local`, fill it in, run `vercel dev`.

## Security notes
- PINs are bcrypt-hashed; 5 wrong tries locks that account for 15 minutes.
- Tables have Row Level Security on with no policies, so the browser can't read them directly. Only the API (service role key) can.
- The service_role key must never go in front-end code or a public repo.
- Admin uses a separate long password, not a PIN.
