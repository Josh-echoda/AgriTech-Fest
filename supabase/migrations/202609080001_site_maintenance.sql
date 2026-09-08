-- Launch in maintenance mode. Preserve other publishing switches.
update public.site_settings
set value = jsonb_set(value, '{site_live}', 'false'::jsonb)
where key = 'publishing';

-- Expose only the public visibility flag, never other settings.
create or replace function public.get_site_live()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((select (value ->> 'site_live')::boolean
    from public.site_settings where key = 'publishing'), false);
$$;
revoke all on function public.get_site_live() from public;
grant execute on function public.get_site_live() to anon, authenticated;

create or replace function public.set_site_live(site_live boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.can_access('settings') then
    raise exception 'You do not have permission to change site maintenance.' using errcode = '42501';
  end if;
  if site_live is null then raise exception 'Site status is required.'; end if;
  insert into public.site_settings(key, value, description)
  values ('publishing', jsonb_build_object('site_live', site_live), 'Public site feature switches')
  on conflict (key) do update
    set value = jsonb_set(public.site_settings.value, '{site_live}', to_jsonb(site_live));
end;
$$;
revoke all on function public.set_site_live(boolean) from public;
grant execute on function public.set_site_live(boolean) to authenticated;
