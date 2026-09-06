drop policy if exists "Team members read own access" on public.admin_users;
drop policy if exists "Team members view their allowlist entry" on public.admin_email_allowlist;

create policy "Team members read own access" on public.admin_users
for select to authenticated using (user_id = auth.uid());

create or replace function public.deactivate_removed_team_member()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.admin_users set is_active=false where email=old.email;
  return old;
end;
$$;

drop trigger if exists on_allowlist_deleted_revoke_access on public.admin_email_allowlist;
create trigger on_allowlist_deleted_revoke_access after delete on public.admin_email_allowlist
for each row execute function public.deactivate_removed_team_member();

create policy "Team members view their allowlist entry" on public.admin_email_allowlist
for select to authenticated using (email = lower(auth.jwt() ->> 'email'));
