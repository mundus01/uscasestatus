-- Anonymized lookup corpus. Stores a receipt *block* (prefix + fiscal day),
-- never the full receipt serial, so individuals cannot be identified from this
-- table alone.

create table if not exists public.lookups (
  id uuid primary key default gen_random_uuid(),
  receipt_block text not null,
  prefix text not null,
  form_type text,
  status_slug text not null,
  status_text text not null,
  checked_at timestamptz not null default now()
);

create index if not exists lookups_checked_at_idx on public.lookups (checked_at desc);
create index if not exists lookups_form_status_idx on public.lookups (form_type, status_slug);
create index if not exists lookups_receipt_block_idx on public.lookups (receipt_block);

alter table public.lookups enable row level security;

-- No public read/write. Service role bypasses RLS for inserts from the API.
