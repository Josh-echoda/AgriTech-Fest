alter table public.admin_users
  add column if not exists email text,
  add column if not exists permissions text[] not null default '{}',
  add column if not exists is_active boolean not null default true;

alter table public.admin_email_allowlist
  add column if not exists display_name text,
  add column if not exists permissions text[] not null default '{}',
  add column if not exists is_active boolean not null default true;

alter table public.admin_users drop constraint if exists admin_users_role_check;
alter table public.admin_users add constraint admin_users_role_check
  check (role in ('admin','content_editor','programme_manager','partnerships','registration','reviewer','viewer'));
alter table public.admin_email_allowlist drop constraint if exists admin_email_allowlist_role_check;
alter table public.admin_email_allowlist add constraint admin_email_allowlist_role_check
  check (role in ('admin','content_editor','programme_manager','partnerships','registration','reviewer','viewer'));

update public.admin_users set email = lower(u.email)
from auth.users u where u.id = admin_users.user_id;

create unique index if not exists idx_admin_users_email on public.admin_users(email) where email is not null;

create or replace function public.can_access(area text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid() and is_active = true
      and (role = 'admin' or area = any(permissions))
  );
$$;

create or replace function public.bootstrap_admin_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare member public.admin_email_allowlist%rowtype;
begin
  select * into member from public.admin_email_allowlist
  where email = lower(new.email) and is_active = true;
  if found then
    insert into public.admin_users(user_id, email, display_name, role, permissions, is_active)
    values (new.id, lower(new.email), coalesce(member.display_name, new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)), member.role, member.permissions, true)
    on conflict (user_id) do update set email=excluded.email, display_name=excluded.display_name, role=excluded.role, permissions=excluded.permissions, is_active=true;
  end if;
  return new;
end;
$$;

create or replace function public.sync_team_member_access()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.admin_users
  set display_name=coalesce(new.display_name, display_name), role=new.role, permissions=new.permissions, is_active=new.is_active
  where email=new.email;
  return new;
end;
$$;

drop trigger if exists on_allowlist_changed_sync_access on public.admin_email_allowlist;
create trigger on_allowlist_changed_sync_access after update on public.admin_email_allowlist
for each row execute function public.sync_team_member_access();

create policy "Registration team reads tickets" on public.tickets for select to authenticated using (public.can_access('tickets'));
create policy "Registration team updates checkin" on public.tickets for update to authenticated using (public.can_access('tickets')) with check (public.can_access('tickets'));
create policy "Programme team manages days" on public.programme_days for all to authenticated using (public.can_access('programme')) with check (public.can_access('programme'));
create policy "Programme team manages sessions" on public.programme_sessions for all to authenticated using (public.can_access('programme')) with check (public.can_access('programme'));
create policy "Content team manages pages" on public.pages for all to authenticated using (public.can_access('pages')) with check (public.can_access('pages'));
create policy "Speaker team manages speakers" on public.speakers for all to authenticated using (public.can_access('speakers')) with check (public.can_access('speakers'));
create policy "Exhibitor team manages exhibitors" on public.exhibitors for all to authenticated using (public.can_access('exhibitors')) with check (public.can_access('exhibitors'));
create policy "Partner team manages partners" on public.partners for all to authenticated using (public.can_access('partners')) with check (public.can_access('partners'));
create policy "Review team manages battlefield" on public.battlefield_applications for all to authenticated using (public.can_access('battlefield')) with check (public.can_access('battlefield'));
create policy "Inbox team manages enquiries" on public.enquiries for all to authenticated using (public.can_access('inbox')) with check (public.can_access('inbox'));
create policy "Newsletter team manages campaigns" on public.newsletters for all to authenticated using (public.can_access('newsletter')) with check (public.can_access('newsletter'));
create policy "Newsletter team reads subscribers" on public.newsletter_subscribers for select to authenticated using (public.can_access('newsletter'));

update public.admin_email_allowlist
set display_name='Admin Office', role='admin', permissions='{}', is_active=true
where email='info@e360.africa';
