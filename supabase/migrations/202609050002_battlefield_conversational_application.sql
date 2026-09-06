alter table public.battlefield_applications
  add column if not exists reference_code text unique default ('ATB-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  add column if not exists application_data jsonb not null default '{}'::jsonb,
  add column if not exists document_paths jsonb not null default '{}'::jsonb;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('battlefield-applications', 'battlefield-applications', false, 10485760, array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','image/jpeg','image/png'])
on conflict (id) do update set public = false, file_size_limit = 10485760, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Applicants upload battlefield documents" on storage.objects;
create policy "Applicants upload battlefield documents" on storage.objects for insert to anon, authenticated
with check (bucket_id = 'battlefield-applications');

drop policy if exists "Admins read battlefield documents" on storage.objects;
create policy "Admins read battlefield documents" on storage.objects for select to authenticated
using (bucket_id = 'battlefield-applications' and public.is_admin());
