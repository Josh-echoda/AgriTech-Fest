import { createClient } from 'npm:@supabase/supabase-js@2';
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: cors });
Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const secret = Deno.env.get('PAYSTACK_SECRET_KEY') || '';
    // Production checkout must use a live server-side key. Never expose this key to the browser.
    if (!secret.startsWith('sk_live_')) return json({ error: 'Live checkout is not configured. Please contact info@e360.africa.' }, 503);
    const url = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const db = createClient(url, serviceKey);
    const raw = await request.text();
    if (raw.length > 16000) return json({ error: 'Request too large' }, 413);
    const signature = request.headers.get('x-paystack-signature');
    let body = JSON.parse(raw);
    if (signature) {
      const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-512' }, false, ['verify']);
      if (!/^[a-f0-9]{128}$/i.test(signature)) return json({ error: 'Invalid signature' }, 401);
      const bytes = Uint8Array.from(signature.match(/.{2}/g)!, x => parseInt(x,16));
      if (!await crypto.subtle.verify('HMAC',key,bytes,new TextEncoder().encode(raw))) return json({ error: 'Invalid signature' },401);
      if (body.event !== 'charge.success') return json({ received: true });
      body = { action: 'verify', reference: body.data?.reference };
    }
    async function paystack(path: string, data?: unknown) {
      const response = await fetch(`https://api.paystack.co/${path}`, { method: data ? 'POST' : 'GET', headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' }, body: data ? JSON.stringify(data) : undefined });
      const result = await response.json();
      if (!response.ok || !result.status) throw new Error('Paystack is temporarily unavailable. Please retry.');
      return result.data;
    }
    if (body.action === 'initialize') {
      const input = body.input || {};
      const fields = ['full_name','email','phone','accessibility_notes','role_designation','looking_forward_to','heard_about'];
      const attendee: Record<string,string> = {};
      for (const field of fields) attendee[field] = String(input[field] || '').trim().slice(0,2000);
      const allowedDays = ['2026-11-17','2026-11-18','2026-11-19'];
      const attendanceDates = [...new Set(Array.isArray(input.attendance_dates) ? input.attendance_dates.map(String) : [String(input.attendance_date || '')])].filter(day => allowedDays.includes(day)).sort();
      if (!attendee.full_name || !attendee.phone || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(attendee.email) || attendanceDates.length < 1 || attendanceDates.length > 3) return json({ error: 'Please complete your name, email, phone and attendance days.' },400);
      const site = Deno.env.get('PAYSTACK_SITE_URL');
      if (!site) return json({ error: 'Checkout return address has not been configured.' },503);
      const reference = `ATFP-${crypto.randomUUID()}`;
      const { data: ticket, error } = await db.from('tickets').insert({ ...attendee, attendance_date: attendanceDates[0], attendance_dates: attendanceDates, ticket_type: 'Premium pass', status: 'pending', payment_reference: reference, payment_status: 'pending', payment_amount: 5000000, payment_domain: 'live' }).select('id').single();
      if (error) return json({ error: 'Unable to reserve your pass. Registration may be full; contact info@e360.africa.' },409);
      try {
        const result = await paystack('transaction/initialize', { email: attendee.email, amount: 5000000, currency: 'NGN', reference, callback_url: `${site.replace(/\/$/,'')}/tickets`, metadata: { ticket_id: ticket.id, attendance_days: attendanceDates } });
        return json({ authorization_url: result.authorization_url, reference });
      } catch (error) {
        await db.from('tickets').update({ status: 'cancelled' }).eq('id',ticket.id);
        throw error;
      }
    }
    if (body.action !== 'verify' || !/^ATFP-[a-f0-9-]{36}$/.test(String(body.reference))) return json({ error: 'Invalid payment reference' },400);
    const { data: ticket, error } = await db.from('tickets').select('*').eq('payment_reference',body.reference).single();
    if (error || !ticket) return json({ error: 'Payment reference not found' },404);
    const transaction = await paystack(`transaction/verify/${encodeURIComponent(body.reference)}`);
    if (transaction.status !== 'success') return json({ error: 'Payment has not completed. You can retry verification without paying again.' },409);
    // Paystack may add processing fees to the customer total. Validate the
    // original requested price, and account for any surcharge exactly.
    const expectedAmount = ticket.payment_amount;
    const requestedAmount = transaction.requested_amount ?? transaction.amount;
    const amountMatches = expectedAmount === 5000000 && requestedAmount === expectedAmount
      && Number.isSafeInteger(transaction.amount)
      && (transaction.amount === expectedAmount
        || (Number.isSafeInteger(transaction.fees) && transaction.fees > 0
          && transaction.amount - expectedAmount === transaction.fees));
    const mismatches = [
      !amountMatches ? 'amount' : '',
      transaction.currency !== 'NGN' ? 'currency' : '',
      transaction.domain !== 'live' ? 'mode' : '',
      transaction.reference !== ticket.payment_reference ? 'reference' : '',
      String(transaction.customer?.email).toLowerCase() !== ticket.email.toLowerCase() ? 'email' : '',
    ].filter(Boolean);
    if (mismatches.length) return json({ error: `Payment verification mismatch (${mismatches.join(', ')}). Contact info@e360.africa; do not pay again.` },409);
    if (ticket.status === 'cancelled') return json({ error: 'This registration was cancelled. Contact info@e360.africa with your payment reference; do not pay again.' },409);
    // Conditional update is idempotent across callback refreshes and webhook retries.
    if (ticket.payment_status !== 'paid') {
      const { error: updateError } = await db.from('tickets').update({ payment_status:'paid', paid_at:transaction.paid_at || new Date().toISOString(), status:'confirmed' }).eq('id',ticket.id).eq('payment_status','pending').eq('status','pending');
      if (updateError) throw new Error('Payment received, but ticket confirmation needs retrying. Do not pay again.');
    }
    const { data: confirmed, error: confirmError } = await db.from('tickets').select('status,payment_status').eq('id',ticket.id).single();
    if (confirmError || !confirmed || confirmed.payment_status !== 'paid' || !['confirmed','checked_in'].includes(confirmed.status)) return json({ error: 'Payment verification needs staff review. Contact info@e360.africa and do not pay again.' },409);
    // Existing email endpoint uses provider idempotency to prevent duplicate emails.
    await fetch(`${url}/functions/v1/send-confirmation`, { method:'POST', headers:{ Authorization:`Bearer ${serviceKey}`, 'Content-Type':'application/json' }, body:JSON.stringify({ kind:'ticket', code:ticket.ticket_code }) }).catch(() => null);
    return json({ ticket: { id:ticket.ticket_code, name:ticket.full_name, email:ticket.email, type:ticket.ticket_type, day:ticket.attendance_date, days:ticket.attendance_dates || [ticket.attendance_date] }, test:false });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Payment could not be processed. Please retry.' },500);
  }
});
