begin;

create table if not exists public.ticket_registrant_identities (
  identity_type text not null check (identity_type in ('email', 'phone')),
  identity_value text not null,
  ticket_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (identity_type, identity_value)
);

alter table public.ticket_registrant_identities enable row level security;
revoke all on public.ticket_registrant_identities from anon, authenticated;

create or replace function public.normalise_ticket_phone(value text)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select case
    when length(regexp_replace(value, '[^0-9]', '', 'g')) = 13
      and regexp_replace(value, '[^0-9]', '', 'g') like '234%'
      then '0' || substr(regexp_replace(value, '[^0-9]', '', 'g'), 4)
    else regexp_replace(value, '[^0-9]', '', 'g')
  end
$$;

insert into public.ticket_registrant_identities (identity_type, identity_value, ticket_id, created_at)
select distinct on (lower(btrim(email))) 'email', lower(btrim(email)), id, created_at
from public.tickets
where nullif(btrim(email), '') is not null
order by lower(btrim(email)), created_at, id
on conflict do nothing;

insert into public.ticket_registrant_identities (identity_type, identity_value, ticket_id, created_at)
select distinct on (public.normalise_ticket_phone(phone)) 'phone', public.normalise_ticket_phone(phone), id, created_at
from public.tickets
where nullif(public.normalise_ticket_phone(phone), '') is not null
order by public.normalise_ticket_phone(phone), created_at, id
on conflict do nothing;

create or replace function public.reserve_ticket_registrant_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalised_email text := lower(btrim(new.email));
  normalised_phone text := public.normalise_ticket_phone(new.phone);
begin
  if normalised_email = '' or normalised_phone is null or normalised_phone = '' then
    raise exception using errcode = '22023', message = 'Email and phone number are required for ticket registration.';
  end if;

  begin
    insert into public.ticket_registrant_identities (identity_type, identity_value, ticket_id)
    values ('email', normalised_email, new.id), ('phone', normalised_phone, new.id);
  exception when unique_violation then
    raise exception using errcode = '23505', message = 'This email address or phone number has already been used to register for a ticket.';
  end;

  new.email := normalised_email;
  new.phone := normalised_phone;
  return new;
end
$$;

drop trigger if exists reserve_ticket_registrant_identity on public.tickets;
create trigger reserve_ticket_registrant_identity
before insert on public.tickets
for each row execute function public.reserve_ticket_registrant_identity();

commit;
