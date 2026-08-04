-- Account deletion: cascade tracked_cases when auth.users is removed,
-- and allow authenticated users to delete their own tracked rows.
-- App-level DELETE /api/account also removes rows by account email before
-- calling auth.admin.deleteUser (email-only tracks may have null user_id).

alter table public.tracked_cases
  drop constraint if exists tracked_cases_user_id_fkey;

alter table public.tracked_cases
  add constraint tracked_cases_user_id_fkey
  foreign key (user_id)
  references auth.users (id)
  on delete cascade;

drop policy if exists tracked_cases_delete_own on public.tracked_cases;

create policy tracked_cases_delete_own on public.tracked_cases
  for delete
  to authenticated
  using (auth.uid() = user_id);
