begin;
alter table public.tickets add column if not exists payment_reference text unique;
alter table public.tickets add column if not exists payment_status text not null default 'not_required' check (payment_status in ('not_required','pending','paid'));
alter table public.tickets add column if not exists payment_amount integer;
alter table public.tickets add column if not exists payment_domain text;
alter table public.tickets add column if not exists paid_at timestamptz;
-- Public clients may register free passes only. Premium creation and payment fields
-- are controlled by the service role, including when a signed-in admin registers.
create or replace function public.guard_ticket_payment() returns trigger
language plpgsql set search_path = public as $$
begin
  if coalesce(auth.role(),'') <> 'service_role' then
    if TG_OP = 'INSERT' then
      if new.ticket_type <> 'Regular pass' or new.payment_reference is not null or new.payment_status <> 'not_required' or new.payment_amount is not null or new.paid_at is not null or new.payment_domain is not null then
        raise exception 'Premium tickets must be purchased through checkout.';
      end if;
    elsif new.payment_reference is distinct from old.payment_reference or new.payment_status is distinct from old.payment_status or new.payment_amount is distinct from old.payment_amount or new.paid_at is distinct from old.paid_at or new.payment_domain is distinct from old.payment_domain or new.ticket_type is distinct from old.ticket_type then
      raise exception 'Payment fields are managed by the payment service.';
    end if;
  end if;
  if new.ticket_type = 'Premium pass' and new.payment_status = 'pending' and new.status in ('confirmed','checked_in') then
    raise exception 'Payment must be verified before admission.';
  end if;
  if new.payment_domain = 'test' and new.status = 'checked_in' then
    raise exception 'Test payment tickets are not valid for admission.';
  end if;
  return new;
end $$;
create trigger guard_ticket_payment before insert or update on public.tickets for each row execute function public.guard_ticket_payment();
-- Test transactions must not consume the real event capacity.
create or replace function public.enforce_ticket_capacity() returns trigger
language plpgsql set search_path = public as $$
declare active_registrations integer;
begin
  if new.payment_domain = 'test' then return new; end if;
  perform pg_advisory_xact_lock(hashtextextended('agritech-fest-2026-ticket-capacity', 0));
  select count(*) into active_registrations from public.tickets
  where status <> 'cancelled' and payment_domain is distinct from 'test';
  if active_registrations >= 200 then raise exception 'Event registration capacity has been reached.'; end if;
  return new;
end $$;
commit;
