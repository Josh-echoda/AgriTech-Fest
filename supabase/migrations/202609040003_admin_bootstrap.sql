create table public.admin_email_allowlist (
  email text primary key check (email = lower(email)),
  role text not null default 'admin' check (role in ('admin', 'editor', 'check_in')),
  created_at timestamptz not null default now()
);

alter table public.admin_email_allowlist enable row level security;
create policy "Admins view allowlist" on public.admin_email_allowlist for select to authenticated using (public.is_admin());
create policy "Admins manage allowlist" on public.admin_email_allowlist for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into public.admin_email_allowlist(email, role)
values ('info@e360.africa', 'admin')
on conflict (email) do update set role = excluded.role;

create or replace function public.bootstrap_admin_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare allowed_role text;
begin
  select role into allowed_role
  from public.admin_email_allowlist
  where email = lower(new.email);

  if allowed_role is not null then
    insert into public.admin_users(user_id, display_name, role)
    values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)), allowed_role)
    on conflict (user_id) do update set role = excluded.role;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created_grant_admin
after insert on auth.users
for each row execute function public.bootstrap_admin_user();

insert into public.admin_users(user_id, display_name, role)
select id, coalesce(raw_user_meta_data ->> 'display_name', split_part(email, '@', 1)), 'admin'
from auth.users
where lower(email) = 'info@e360.africa'
on conflict (user_id) do update set role = 'admin';
