# Supabase setup (from scratch)

This project uses Supabase for:

1. **Postgres** — `lookups`, `cases`, `case_events`, `tracked_cases`
2. **Auth** — magic-link sign-in for `/dashboard`

You do **not** need the Supabase CLI for the first setup. The SQL Editor is enough.

---

## 1. Create a project

1. Go to [https://supabase.com](https://supabase.com) → **Start your project**
2. Create an organization if prompted
3. **New project**
   - Name: `uscasestatus` (or anything)
   - Database password: generate and **save it** (you rarely need it for this app)
   - Region: pick closest to you / Vercel (e.g. US East)
4. Wait until the project is **Ready**

---

## 2. Copy API keys into `.env.local`

### Where to click (Supabase dashboard)

1. Open your project at [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Bottom-left (or gear icon): **Project Settings**
3. Then either:
   - **API** (older UI) — shows Project URL + Legacy API keys, or
   - **API Keys** (newer UI) — **Publishable** / **Secret** / **Legacy API Keys** tabs

You can also click **Connect** near the top of the project and copy values from there.

### What to copy

| What you see in Supabase | Put in `.env.local` as |
|---|---|
| **Project URL** (`https://xxxx.supabase.co`) | `NEXT_PUBLIC_SUPABASE_URL` |
| **anon** / **public** / **publishable** key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **service_role** / **secret** key | `SUPABASE_SERVICE_ROLE_KEY` |

If you see **Legacy API Keys**, use:

- `anon` `public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` `secret` → `SUPABASE_SERVICE_ROLE_KEY`

(Reveal / copy the `service_role` key — it’s hidden by default.)

Example:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...   # anon public
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...      # service_role — NEVER expose to the browser
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Important**

- `anon` is safe for the browser (RLS protects data)
- `service_role` bypasses RLS — only on the server (our API/cron already use it that way)
- Never commit `.env.local`

Restart the Next.js dev server after saving env vars:

```bash
# Ctrl+C then:
npm run dev
```

---

## 3. Run the database migrations

In Supabase: **SQL → New query**

### Migration 1 — anonymized lookups

Paste the full contents of:

`supabase/migrations/001_lookups.sql`

Click **Run**. You should see success.

### Migration 2 — cases, events, tracking

Paste the full contents of:

`supabase/migrations/002_tracking.sql`

Click **Run**.

### Verify tables exist

**Table Editor** should show:

- `lookups`
- `cases`
- `case_events`
- `tracked_cases`

Or run:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('lookups', 'cases', 'case_events', 'tracked_cases')
order by table_name;
```

---

## 4. Configure Auth (magic link)

### 4a. Enable email auth

**Authentication → Providers → Email**

- Enable **Email**
- Enable **Confirm email** (recommended)
- For local testing you can disable “Confirm email” temporarily, but production should keep it on

We use **magic links** (`signInWithOtp`), not passwords. Password sign-up can stay off.

### 4b. URL configuration

**Authentication → URL Configuration**

Set:

| Field | Local | Production (later) |
|---|---|---|
| **Site URL** | `http://localhost:3000` | `https://uscasestatus.com` |
| **Redirect URLs** | see below | see below |

**Redirect URLs** — add all of these (one per line):

```text
http://localhost:3000/auth/callback
http://localhost:3000/auth/callback?next=/dashboard
http://127.0.0.1:3000/auth/callback
```

When you deploy:

```text
https://uscasestatus.com/auth/callback
https://uscasestatus.com/auth/callback?next=/dashboard
https://uscasestatus.com/es/auth/callback
```

(Our callback route is `/auth/callback` — not under `/es`.)

### 4c. Email delivery (dev vs prod)

By default Supabase sends auth emails through their built-in provider (rate-limited; fine for testing).

For production later:

- **Authentication → Emails** — customize templates optional
- Or connect **SMTP** / Resend for higher volume

**Note:** Case-status alert emails (track confirm / status change) use **Resend** (`RESEND_API_KEY`), not Supabase mail. Magic-link sign-in uses Supabase Auth email unless you customize it.

---

## 5. Quick smoke tests

With `npm run dev` running and env vars set:

### A. Lookup writes a case row

1. Open `http://localhost:3000`
2. Check a sandbox receipt (e.g. `EAC9999103402`) during USCIS sandbox hours
3. In Supabase **Table Editor → `cases`**, you should see a new row
4. **`lookups`** should also get an anonymized row (`receipt_block`, not full serial)

If tables stay empty: check the terminal for `[lookups]` / `[case-store]` warnings — usually a wrong `SUPABASE_SERVICE_ROLE_KEY` or migration not run.

### B. Magic link sign-in

1. Open `http://localhost:3000/sign-in`
2. Enter your email → send link
3. Open the email → click link
4. You should land on `/dashboard`

If redirect fails: fix **Redirect URLs** in Auth settings (step 4b).

### C. Track a case (needs Resend)

1. On a case page, use **Track this case**
2. Confirm email from Resend
3. Row appears in `tracked_cases` with `confirmed = true`

Without `RESEND_API_KEY`, the track row can still be created, but you won’t get the confirm email (check `confirm_token` in Table Editor and hit `/api/track/confirm?token=...` manually for local testing).

---

## 6. Optional: Supabase CLI (later)

If you prefer migrations from the terminal:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

`YOUR_PROJECT_REF` is the subdomain in your URL: `https://YOUR_PROJECT_REF.supabase.co`.

---

## 7. Checklist

- [ ] Project created
- [ ] `.env.local` has URL + anon + service_role
- [ ] `001_lookups.sql` run
- [ ] `002_tracking.sql` run
- [ ] Auth Email provider enabled
- [ ] Site URL = `http://localhost:3000`
- [ ] Redirect URL includes `/auth/callback`
- [ ] Dev server restarted
- [ ] Case check creates rows in `cases` / `lookups`
- [ ] Sign-in magic link reaches `/dashboard`

---

## Common errors

| Symptom | Fix |
|---|---|
| `Missing environment variable NEXT_PUBLIC_SUPABASE_URL` | Add keys to `.env.local`, restart `npm run dev` |
| Header / dashboard crashes on load | Same — public env vars missing |
| Magic link opens but doesn’t sign in | Add exact callback URL to Redirect URLs |
| Lookups never appear | Wrong `SUPABASE_SERVICE_ROLE_KEY`, or RLS/migration missing |
| `relation "tracked_cases" does not exist` | Run `002_tracking.sql` |
| Auth email never arrives | Check spam; Supabase free email is rate-limited; try another address |

---

## What this app stores

| Table | Purpose |
|---|---|
| `lookups` | Anonymized corpus (receipt **block** only) |
| `cases` | Full receipt + latest status (tracking + nearby) |
| `case_events` | Status transitions over time |
| `tracked_cases` | Email alert subscriptions (+ optional `user_id`) |

Users sign in with magic link; dashboard lists their confirmed tracked cases.
