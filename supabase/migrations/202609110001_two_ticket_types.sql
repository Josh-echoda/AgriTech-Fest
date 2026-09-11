alter table public.tickets drop constraint if exists tickets_ticket_type_check;

update public.tickets
set ticket_type = case
  when ticket_type = 'Corporate pass' then 'Premium pass'
  else 'Regular pass'
end
where ticket_type in ('Student pass', 'Regular pass', 'Corporate pass');

alter table public.tickets
  add constraint tickets_ticket_type_check
  check (ticket_type in ('Regular pass', 'Premium pass'));