begin;

create sequence if not exists public.ticket_code_four_digit_seq
  as integer
  minvalue 0
  maxvalue 9999
  start with 1
  no cycle;

grant usage, select on sequence public.ticket_code_four_digit_seq to anon, authenticated, service_role;

alter table public.tickets
  alter column ticket_code set default (
    'ATF-' || lpad(nextval('public.ticket_code_four_digit_seq')::text, 4, '0')
  );

alter table public.tickets
  add constraint tickets_new_four_digit_code_check
  check (ticket_code ~ '^ATF-[0-9]{4}$') not valid;

commit;
