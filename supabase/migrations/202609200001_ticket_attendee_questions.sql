alter table public.tickets
  add column if not exists role_designation text,
  add column if not exists looking_forward_to text,
  add column if not exists heard_about text;
