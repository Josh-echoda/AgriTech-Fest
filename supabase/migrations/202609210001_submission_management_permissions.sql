-- Extend management only to team members already assigned these sections.
create policy "Newsletter team updates subscribers" on public.newsletter_subscribers
for update to authenticated
using (public.can_access('newsletter')) with check (public.can_access('newsletter'));

create policy "Newsletter team deletes subscribers" on public.newsletter_subscribers
for delete to authenticated using (public.can_access('newsletter'));

create policy "Battlefield team reads application documents" on storage.objects
for select to authenticated
using (bucket_id = 'battlefield-applications' and public.can_access('battlefield'));
