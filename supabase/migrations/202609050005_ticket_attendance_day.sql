alter table public.tickets
  add column if not exists attendance_date date;

update public.tickets
set attendance_date = '2026-11-12'
where attendance_date is null;

alter table public.tickets
  alter column attendance_date set not null;

alter table public.tickets
  drop constraint if exists tickets_attendance_date_check;

alter table public.tickets
  add constraint tickets_attendance_date_check
  check (attendance_date in ('2026-11-12', '2026-11-13', '2026-11-14'));

create index if not exists idx_tickets_attendance_date_status
  on public.tickets(attendance_date, status);
