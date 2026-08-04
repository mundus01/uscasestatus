# Supabase setup (from scratch)

This project uses Supabase for:

1. **Postgres** — `lookups`, `cases`, `case_events`, `tracked_cases`, `case_claims`
2. **Auth** — email/password, Google OAuth, and optional magic-link for `/dashboard` and `/settings`

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
NEXT_PUBLIC_SITE_URL=http://localhost:3000   # local only
```

**Production (Vercel) must use:**

```bash
NEXT_PUBLIC_SITE_URL=https://uscasestatus.com
```

If this is left as `http://localhost:3000` (or Supabase **Site URL** is localhost), magic-link emails open localhost instead of production.

**Important**

- `anon` is safe for the browser (RLS protects data)
- `service_role` bypasses RLS — only on the server (our API/cron already use it that way)
- Never commit `.env.local`
- Never put Google Client Secrets or Supabase service role keys in the repo

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

### Migration 3 — case claims (filing details)

Paste the full contents of:

`supabase/migrations/003_case_claims.sql`

Click **Run**.

### Migration 4 — account deletion cascade

Paste the full contents of:

`supabase/migrations/004_account_deletion.sql`

Click **Run**. Required for Settings → Delete account (`DELETE /api/account`), which uses the **service_role** key already in env to call `auth.admin.deleteUser` after wiping `case_claims` and `tracked_cases`.

### Verify tables exist

**Table Editor** should show:

- `lookups`
- `cases`
- `case_events`
- `tracked_cases`
- `case_claims`

Or run:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('lookups', 'cases', 'case_events', 'tracked_cases')
order by table_name;
```

---

## 4. Configure Auth (production checklist)

> **Root cause of “magic link opens localhost”:**  
> Supabase **Authentication → URL Configuration → Site URL** was almost certainly still `http://localhost:3000`. When a redirect is missing from the allowlist, Supabase falls back to Site URL — so live emails open localhost with `#access_token=...`.

### 4a. URL configuration (do this first)

**Authentication → URL Configuration**

| Field | Value |
|---|---|
| **Site URL** | `https://uscasestatus.com` |

**Redirect URLs** — add all of these (one per line; wildcards are supported):

```text
https://uscasestatus.com/**
https://www.uscasestatus.com/**
http://localhost:3000/**
http://127.0.0.1:3000/**
```

Explicit callback paths (optional but clear):

```text
https://uscasestatus.com/auth/callback
https://www.uscasestatus.com/auth/callback
http://localhost:3000/auth/callback
http://127.0.0.1:3000/auth/callback
```

Our callback route is always `/auth/callback` (not under `/es`).

Also set on **Vercel → Project → Settings → Environment Variables** (Production):

```bash
NEXT_PUBLIC_SITE_URL=https://uscasestatus.com
```

Redeploy after changing that env var.

### 4b. Enable Email provider (password + magic link)

**Authentication → Providers → Email**

- Enable **Email**
- Enable **Email password** sign-in (password auth)
- Enable **Confirm email** for production (recommended)
- Magic links use `signInWithOtp` from `/api/auth/magic-link` with `emailRedirectTo` → `https://uscasestatus.com/auth/callback?next=...`

### 4c. Enable Google provider

**Authentication → Providers → Google** → Enable

You need a Google OAuth **Client ID** and **Client Secret** from Google Cloud Console.

#### Google Cloud Console steps

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. **APIs & Services → OAuth consent screen**
   - User type: **External** (unless you only allow your Workspace)
   - App name: `uscasestatus`
   - Support email: your email
   - Authorized domains: `uscasestatus.com` and your Supabase domain host (e.g. `xxxxxxxx.supabase.co`) if prompted
   - Save
4. **APIs & Services → Credentials → Create credentials → OAuth client ID**
   - Application type: **Web application**
   - Name: `uscasestatus Supabase`
   - **Authorized JavaScript origins:**
     - `https://uscasestatus.com`
     - `https://www.uscasestatus.com`
     - `http://localhost:3000` (local)
   - **Authorized redirect URIs** — this must be the **Supabase** callback, not your app:

```text
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

   `YOUR_PROJECT_REF` is the subdomain in **Project Settings → API → Project URL**  
   Example: `https://abcdxyz.supabase.co/auth/v1/callback`

5. Copy **Client ID** and **Client Secret** into Supabase → **Authentication → Providers → Google**
6. Save in Supabase

No Google secrets go in the Next.js `.env` — Supabase stores them.

### 4d. Email delivery (dev vs prod)

By default Supabase sends auth emails through their built-in provider (rate-limited; fine for testing).

For production later:

- **Authentication → Emails** — customize templates optional
- Or connect **SMTP** / Resend for higher volume

**Note:** Case-status alert emails (track confirm / status change) use **Resend** (`RESEND_API_KEY`), not Supabase mail. Auth emails (magic link, confirm signup) use Supabase Auth email unless you customize SMTP.

---

## 5. How auth works in this app

| Method | Flow |
|---|---|
| **Google** | Browser `signInWithOAuth` → Google → Supabase → `/auth/callback?code=...` → session cookies → `next` or `/dashboard` |
| **Email + password** | Browser `signInWithPassword` / `signUp` (confirm email may be required) |
| **Magic link** | `POST /api/auth/magic-link` → Supabase email with `emailRedirectTo` → `/auth/callback?code=...` |

Hash tokens (`#access_token=...`) are recovered client-side by `AuthHashHandler` (legacy / misconfigured Site URL), then stripped from the address bar.

---

## 6. Quick smoke tests

### A. Lookup writes a case row

1. Open the site
2. Check a sandbox receipt (e.g. `EAC9999103402`) during USCIS sandbox hours
3. In Supabase **Table Editor → `cases`**, you should see a new row

### B. Password sign-in

1. Open `https://uscasestatus.com/sign-in` (or `http://localhost:3000/sign-in`)
2. **Password** tab → **Create account** → email + password (8+ chars)
3. Confirm email if required, then **Sign in**
4. You should land on `/dashboard`

### C. Google sign-in

1. On `/sign-in`, click **Continue with Google**
2. Complete Google consent
3. You should return to `/auth/callback` then `/dashboard`
4. If it fails: check Supabase Google provider + Google redirect URI `https://PROJECT.supabase.co/auth/v1/callback`

### D. Magic link

1. On `/sign-in` → **Email link** tab → send link
2. Open the email — the link host must be **`uscasestatus.com`**, not `localhost`
3. You should land on `/dashboard`
4. If the link is localhost: fix **Site URL** + **Redirect URLs** (section 4a) and resend

### E. Track a case (needs Resend)

1. On a case page, use **Track this case**
2. Confirm email from Resend
3. Row appears in `tracked_cases` with `confirmed = true`

---

## 7. Optional: Supabase CLI (later)

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

---

## 8. Checklist

- [ ] Project created
- [ ] `.env.local` has URL + anon + service_role
- [ ] Vercel Production `NEXT_PUBLIC_SITE_URL=https://uscasestatus.com`
- [ ] `001`–`004` migrations run
- [ ] Auth **Site URL** = `https://uscasestatus.com`
- [ ] Redirect URLs include `https://uscasestatus.com/**` and localhost for dev
- [ ] Email provider enabled (password + confirm as desired)
- [ ] Google provider enabled with Cloud Console client; redirect URI is `https://PROJECT.supabase.co/auth/v1/callback`
- [ ] Password signup → dashboard
- [ ] Google → dashboard
- [ ] Magic link email opens **production** host, not localhost

---

## Common errors

| Symptom | Fix |
|---|---|
| Magic link opens `http://localhost:3000/#access_token=...` | Set Supabase **Site URL** to `https://uscasestatus.com`; allowlist production Redirect URLs; set Vercel `NEXT_PUBLIC_SITE_URL` |
| `Missing environment variable NEXT_PUBLIC_SUPABASE_URL` | Add keys to `.env.local` / Vercel, redeploy |
| Magic link opens but doesn’t sign in | Add `/auth/callback` (or `/**`) to Redirect URLs |
| Google redirect_uri_mismatch | Google authorized redirect must be `https://PROJECT.supabase.co/auth/v1/callback` |
| Password sign-up says check email | Confirm email is on — open the confirm link, then sign in |
| Lookups never appear | Wrong `SUPABASE_SERVICE_ROLE_KEY`, or migration missing |
| Auth email never arrives | Check spam; Supabase free email is rate-limited |

---

## What this app stores

| Table | Purpose |
|---|---|
| `lookups` | Anonymized corpus (receipt **block** only) |
| `cases` | Full receipt + latest status (tracking + nearby) |
| `case_events` | Status transitions over time |
| `tracked_cases` | Email alert subscriptions (+ optional `user_id`) |
| `case_claims` | Account-scoped filing details per receipt |

### Account deletion

Signed-in users delete from **`/settings`** (Privacy). The API:

1. Requires a valid session (`getUser`) and `{ confirm: true }`
2. Deletes `case_claims` and `tracked_cases` for that user (and tracks matching the account email)
3. Calls `auth.admin.deleteUser` via `SUPABASE_SERVICE_ROLE_KEY`
4. Signs the browser out and redirects home with `?deleted=1`

**Manual check:** Supabase → **Authentication → Users** — the user row should disappear after delete.
