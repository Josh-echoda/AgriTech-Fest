begin;
alter table public.tickets drop constraint if exists tickets_attendance_dates_check;
alter table public.tickets add constraint tickets_attendance_dates_check check (
  cardinality(attendance_dates) between 1 and 3
  and attendance_dates <@ array[date '2026-11-17', date '2026-11-18', date '2026-11-19']
  and attendance_date = attendance_dates[1]
  and (
    (ticket_type = 'Regular pass' and cardinality(attendance_dates) between 1 and 2)
    or (ticket_type = 'Premium pass' and cardinality(attendance_dates) between 1 and 3)
  )
);
commit;
