-- Account-scoped filing details for a receipt (Phase 3).
-- Separate from tracked_cases (email alerts) so a user can save
-- case context without (or before) enabling alerts.

create table if not exists public.case_claims (
  user_id uuid not null references auth.users (id) on delete cascade,
  receipt text not null,
  country_of_birth text,
  premium_processing text
    check (
      premium_processing is null
      or premium_processing in ('yes', 'no', 'unknown')
    ),
  visa_category text,
  service_center text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, receipt)
);

create index if not exists case_claims_user_idx on public.case_claims (user_id);
create index if not exists case_claims_receipt_idx on public.case_claims (receipt);

alter table public.case_claims enable row level security;

create policy case_claims_select_own on public.case_claims
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy case_claims_insert_own on public.case_claims
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy case_claims_update_own on public.case_claims
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy case_claims_delete_own on public.case_claims
  for delete
  to authenticated
  using (auth.uid() = user_id);
