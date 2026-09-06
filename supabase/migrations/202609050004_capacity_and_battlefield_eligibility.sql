-- Enforce event capacity and Battlefield eligibility at the database boundary.
create or replace function public.enforce_ticket_capacity()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  active_registrations integer;
begin
  perform pg_advisory_xact_lock(hashtextextended('agritech-fest-2026-ticket-capacity', 0));

  select count(*)
    into active_registrations
    from public.tickets
   where status <> 'cancelled';

  if active_registrations >= 200 then
    raise exception using
      errcode = 'P0001',
      message = 'Event registration capacity has been reached.';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_ticket_capacity_before_insert on public.tickets;
create trigger enforce_ticket_capacity_before_insert
before insert on public.tickets
for each row execute function public.enforce_ticket_capacity();

create or replace function public.enforce_battlefield_eligibility()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() and (
    coalesce(new.application_data ->> 'age_eligible', 'No') <> 'Yes'
    or coalesce(new.application_data ->> 'available', 'No') <> 'Yes'
    or coalesce(new.application_data ->> 'agriculture_focus', 'No') <> 'Yes'
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'Applicant does not meet the Battlefield eligibility requirements.';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_battlefield_eligibility_before_insert on public.battlefield_applications;
create trigger enforce_battlefield_eligibility_before_insert
before insert on public.battlefield_applications
for each row execute function public.enforce_battlefield_eligibility();