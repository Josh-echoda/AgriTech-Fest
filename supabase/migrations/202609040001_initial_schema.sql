create extension if not exists pgcrypto;

create type public.content_status as enum ('draft', 'published', 'archived');
create type public.review_status as enum ('pending', 'approved', 'rejected');
create type public.ticket_status as enum ('pending', 'confirmed', 'checked_in', 'cancelled');

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Administrator',
  role text not null default 'admin' check (role in ('admin', 'editor', 'check_in')),
  created_at timestamptz not null default now()
);

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  eyebrow text,
  body jsonb not null default '{}'::jsonb,
  seo_title text,
  seo_description text,
  status public.content_status not null default 'draft',
  sort_order integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.programme_days (
  id uuid primary key default gen_random_uuid(),
  day_number smallint not null unique check (day_number between 1 and 10),
  title text not null,
  theme text,
  event_date date not null,
  venue text,
  description text,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.programme_sessions (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references public.programme_days(id) on delete cascade,
  title text not null,
  description text,
  session_type text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  venue text,
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.speakers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  job_title text,
  organisation text,
  bio text,
  category text,
  image_url text,
  linkedin_url text,
  is_keynote boolean not null default false,
  status public.content_status not null default 'draft',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.session_speakers (
  session_id uuid not null references public.programme_sessions(id) on delete cascade,
  speaker_id uuid not null references public.speakers(id) on delete cascade,
  primary key (session_id, speaker_id)
);

create table public.exhibitors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  booth text,
  description text,
  website_url text,
  logo_url text,
  contact_name text,
  contact_email text,
  review_status public.review_status not null default 'pending',
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tier text not null,
  description text,
  logo_url text,
  website_url text,
  status public.content_status not null default 'draft',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_code text not null unique default ('ATF-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  full_name text not null,
  email text not null,
  phone text,
  ticket_type text not null check (ticket_type in ('Student pass', 'Regular pass', 'Corporate pass')),
  accessibility_notes text,
  status public.ticket_status not null default 'confirmed',
  checked_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.battlefield_applications (
  id uuid primary key default gen_random_uuid(),
  team_name text not null,
  institution text,
  email text not null,
  phone text,
  category text,
  problem text,
  solution text,
  stage text,
  review_status public.review_status not null default 'pending',
  score numeric(5,2),
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  enquiry_type text not null check (enquiry_type in ('contact', 'sponsor', 'media', 'exhibitor', 'founders_mixer')),
  name text not null,
  email text not null,
  phone text,
  organisation text,
  subject text,
  message text,
  payload jsonb not null default '{}'::jsonb,
  status public.review_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  first_name text,
  organisation text,
  job_title text,
  subscribed boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.newsletters (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  preview_text text,
  body text not null default '',
  status public.content_status not null default 'draft',
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid() and role in ('admin', 'editor'));
$$;

do $$ declare table_name text; begin
  foreach table_name in array array['pages','programme_days','programme_sessions','speakers','exhibitors','partners','tickets','battlefield_applications','enquiries','newsletter_subscribers','newsletters','site_settings']
  loop execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name); end loop;
end $$;

create index idx_pages_status_sort on public.pages(status, sort_order);
create index idx_sessions_day_start on public.programme_sessions(day_id, starts_at);
create index idx_speakers_status_sort on public.speakers(status, sort_order);
create index idx_exhibitors_public on public.exhibitors(is_public, category);
create index idx_partners_status_sort on public.partners(status, sort_order);
create index idx_tickets_status_created on public.tickets(status, created_at desc);
create index idx_battlefield_status_created on public.battlefield_applications(review_status, created_at desc);
create index idx_enquiries_status_created on public.enquiries(status, created_at desc);

alter table public.admin_users enable row level security;
alter table public.pages enable row level security;
alter table public.programme_days enable row level security;
alter table public.programme_sessions enable row level security;
alter table public.speakers enable row level security;
alter table public.session_speakers enable row level security;
alter table public.exhibitors enable row level security;
alter table public.partners enable row level security;
alter table public.tickets enable row level security;
alter table public.battlefield_applications enable row level security;
alter table public.enquiries enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.newsletters enable row level security;
alter table public.site_settings enable row level security;

create policy "Admins manage admin users" on public.admin_users for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Published pages are public" on public.pages for select using (status = 'published');
create policy "Published programme days are public" on public.programme_days for select using (status = 'published');
create policy "Published sessions are public" on public.programme_sessions for select using (status = 'published');
create policy "Published speakers are public" on public.speakers for select using (status = 'published');
create policy "Session speakers are public" on public.session_speakers for select using (true);
create policy "Public exhibitors are visible" on public.exhibitors for select using (is_public = true and review_status = 'approved');
create policy "Published partners are public" on public.partners for select using (status = 'published');
create policy "Public can create tickets" on public.tickets for insert to anon, authenticated with check (true);
create policy "Public can apply to battlefield" on public.battlefield_applications for insert to anon, authenticated with check (true);
create policy "Public can send enquiries" on public.enquiries for insert to anon, authenticated with check (true);
create policy "Public can subscribe" on public.newsletter_subscribers for insert to anon, authenticated with check (true);
create policy "Public can update own subscription" on public.newsletter_subscribers for update to anon, authenticated using (true) with check (true);

do $$ declare table_name text; begin
  foreach table_name in array array['pages','programme_days','programme_sessions','speakers','session_speakers','exhibitors','partners','tickets','battlefield_applications','enquiries','newsletter_subscribers','newsletters','site_settings']
  loop execute format('create policy "Admins manage %s" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', table_name, table_name); end loop;
end $$;

insert into public.site_settings(key, value, description) values
  ('event', '{"name":"AgriTech Fest 2026","start_date":"2026-11-12","end_date":"2026-11-14","location":"Kano, Nigeria","contact_email":"info@e360.africa"}', 'Core public event information'),
  ('publishing', '{"site_live":true,"registration_open":true,"battlefield_open":true}', 'Public site feature switches');

insert into public.programme_days(day_number, title, theme, event_date, venue, description, status) values
  (1, 'Cultivate', 'Youth · Innovation · Education', '2026-11-12', 'Audu Bako College of Agriculture, Dambatta University Campus', 'Student engagement, career pathways and agri-tech showcase.', 'published'),
  (2, 'Engineer', 'Farmers · Research · Technology', '2026-11-13', 'Bayero University Kano, BUK New Site Campus', 'Farmer inclusion, research exchange and agri-business.', 'published'),
  (3, 'Scale', 'Policy · Investment · Partnership', '2026-11-14', 'Venue to be confirmed', 'Policy dialogue, investment and major announcements.', 'draft');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-media', 'site-media', true, 5242880, array['image/jpeg','image/png','image/webp','image/svg+xml'])
on conflict (id) do nothing;

create policy "Site media is public" on storage.objects for select using (bucket_id = 'site-media');
create policy "Admins upload site media" on storage.objects for insert to authenticated with check (bucket_id = 'site-media' and public.is_admin());
create policy "Admins update site media" on storage.objects for update to authenticated using (bucket_id = 'site-media' and public.is_admin()) with check (bucket_id = 'site-media' and public.is_admin());
create policy "Admins delete site media" on storage.objects for delete to authenticated using (bucket_id = 'site-media' and public.is_admin());
