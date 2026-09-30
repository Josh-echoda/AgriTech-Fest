begin;
alter table public.tickets add column if not exists attendance_dates date[];
update public.tickets set attendance_dates = array[attendance_date] where attendance_dates is null or cardinality(attendance_dates) = 0;
alter table public.tickets alter column attendance_dates set not null;
alter table public.tickets drop constraint if exists tickets_attendance_dates_check;
alter table public.tickets add constraint tickets_attendance_dates_check check (
  cardinality(attendance_dates) between 1 and 3
  and attendance_dates <@ array[date '2026-11-17', date '2026-11-18', date '2026-11-19']
  and attendance_date = attendance_dates[1]
  and ((ticket_type = 'Regular pass' and cardinality(attendance_dates) = 1) or ticket_type = 'Premium pass')
);
create index if not exists idx_tickets_attendance_dates on public.tickets using gin(attendance_dates);
commit;