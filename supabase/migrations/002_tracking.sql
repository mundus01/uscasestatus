-- Case corpus + tracking/alerts (Phase 2).
-- Full receipts live here for rechecks and nearby analytics.
-- alerts: email (and later push) subscriptions via tracked_cases.

create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  receipt text not null unique,
  prefix text not null,
  form_type text,
  last_status text not null,
  last_status_slug text,
  last_description text,
  submitted_date text,
  modified_date text,
  history jsonb not null default '[]'::jsonb,
  last_checked timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cases_prefix_idx on public.cases (prefix);
create index if not exists cases_form_status_idx on public.cases (form_type, last_status_slug);
create index if not exists cases_last_checked_idx on public.cases (last_checked);

create table if not exists public.case_events (
  id uuid primary key default gen_random_uuid(),
  receipt text not null references public.cases (receipt) on delete cascade,
  from_status text,
  to_status text not null,
  observed_at timestamptz not null default now()
);

create index if not exists case_events_receipt_idx
  on public.case_events (receipt, observed_at desc);

create table if not exists public.tracked_cases (
  id uuid primary key default gen_random_uuid(),
  receipt text not null,
  email text not null,
  user_id uuid references auth.users (id) on delete set null,
  nickname text,
  locale text not null default 'en',
  confirmed boolean not null default false,
  confirm_token text unique,
  unsubscribe_token text not null unique,
  channels jsonb not null default '{"email": true}'::jsonb,
  last_alerted_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email, receipt)
);

create index if not exists tracked_cases_receipt_idx on public.tracked_cases (receipt);
create index if not exists tracked_cases_email_idx on public.tracked_cases (email);
create index if not exists tracked_cases_confirmed_idx
  on public.tracked_cases (confirmed) where confirmed = true;

alter table public.cases enable row level security;
alter table public.case_events enable row level security;
alter table public.tracked_cases enable row level security;

-- Authenticated users can read their own tracked rows (dashboard).
create policy tracked_cases_select_own on public.tracked_cases
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Service role bypasses RLS for API/cron writes. No public insert/update.
