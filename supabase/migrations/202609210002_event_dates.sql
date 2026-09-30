begin;
alter table public.tickets drop constraint if exists tickets_attendance_date_check;
update public.tickets set attendance_date = attendance_date + 5
where attendance_date in ('2026-11-12','2026-11-13','2026-11-14');
alter table public.tickets add constraint tickets_attendance_date_check
check (attendance_date in ('2026-11-17','2026-11-18','2026-11-19'));
update public.programme_days
set event_date = case day_number when 1 then date '2026-11-17' when 2 then date '2026-11-18' when 3 then date '2026-11-19' end
where day_number in (1,2,3);
update public.site_settings
set value = value || '{"start_date":"2026-11-17","end_date":"2026-11-19"}'::jsonb
where key = 'event';
update public.pages set eyebrow = replace(eyebrow, '12–14 November 2026', '17–19 November 2026')
where eyebrow like '%12–14 November 2026%';
commit;
