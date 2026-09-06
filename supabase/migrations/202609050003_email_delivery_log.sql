create table if not exists public.email_deliveries (
  id uuid primary key default gen_random_uuid(),
  record_key text not null unique,
  message_type text not null check (message_type in ('ticket', 'battlefield')),
  recipient text not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  provider_id text,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.email_deliveries enable row level security;

drop policy if exists "Admins read email deliveries" on public.email_deliveries;
create policy "Admins read email deliveries" on public.email_deliveries for select to authenticated
using (public.is_admin());

drop trigger if exists set_email_deliveries_updated_at on public.email_deliveries;
create trigger set_email_deliveries_updated_at before update on public.email_deliveries
for each row execute function public.set_updated_at();

create index if not exists idx_email_deliveries_status_created on public.email_deliveries(status, created_at desc);
