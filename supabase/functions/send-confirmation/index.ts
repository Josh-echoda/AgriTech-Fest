import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type RequestBody = { kind?: 'ticket' | 'battlefield'; code?: string };

function escapeHtml(value: unknown) {
  return String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] || character);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Lagos' }).format(new Date(`${value}T12:00:00+01:00`));
}

function emailFrame(content: string) {
  return `<!doctype html><html><body style="margin:0;background:#eef2ed;font-family:Arial,sans-serif;color:#07131f"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding:32px 16px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;margin:auto;background:#fff;border-radius:22px;overflow:hidden"><tr><td style="padding:28px 32px;background:#07131f;color:#fff"><div style="font-size:13px;font-weight:800;letter-spacing:2px;color:#baff27">AGRITECH FEST 2026</div><div style="margin-top:7px;font-size:13px;color:#b9c4bc">Kano, Nigeria · 17–19 November 2026</div></td></tr><tr><td style="padding:36px 32px">${content}</td></tr><tr><td style="padding:22px 32px;background:#f4f7f2;color:#68756c;font-size:12px;line-height:1.6">AgriTech Fest 2026 · e360 Africa<br>Questions? Reply to this email or contact info@e360.africa.</td></tr></table></td></tr></table></body></html>`;
}

function ticketEmail(ticket: Record<string, unknown>) {
  const name = escapeHtml(ticket.full_name);
  const attendanceDates = Array.isArray(ticket.attendance_dates) && ticket.attendance_dates.length ? ticket.attendance_dates.map(String) : [String(ticket.attendance_date)];
  const date = attendanceDates.map(formatDate).join(' · ');
  return {
    to: String(ticket.email),
    subject: `Your AgriTech Fest ticket · ${date}`,
    html: emailFrame(`<p style="margin:0;color:#3d7a31;font-size:13px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase">Registration confirmed</p><h1 style="margin:14px 0 12px;font-size:34px;line-height:1.1">Your ticket is ready, ${name}.</h1><p style="margin:0 0 26px;color:#56635a;font-size:16px;line-height:1.7">Your attendance selection is confirmed. Present the ticket code below or the QR pass on the website at check-in.</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#07131f;color:#fff;border-radius:16px"><tr><td style="padding:24px"><div style="color:#93a097;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.3px">Admission date${attendanceDates.length > 1 ? 's' : ''}</div><div style="margin-top:5px;font-size:20px;font-weight:700">${escapeHtml(date)}</div><div style="margin-top:20px;color:#93a097;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.3px">Pass type</div><div style="margin-top:5px;font-size:17px">${escapeHtml(ticket.ticket_type)}</div><div style="margin-top:20px;color:#93a097;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.3px">Ticket code</div><div style="margin-top:5px;color:#baff27;font-family:monospace;font-size:22px;font-weight:800;letter-spacing:1px">${escapeHtml(ticket.ticket_code)}</div></td></tr></table><p style="margin:24px 0 0;color:#56635a;font-size:14px;line-height:1.6">Keep this email safe. Each ticket is valid for one attendee and can only be checked in once.</p>`),
  };
}

function battlefieldEmail(application: Record<string, unknown>) {
  const data = (application.application_data || {}) as Record<string, unknown>;
  const name = escapeHtml(data.full_name || application.team_name);
  return {
    to: String(application.email),
    subject: `Battlefield application received · ${application.reference_code}`,
    html: emailFrame(`<p style="margin:0;color:#3d7a31;font-size:13px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase">Application received</p><h1 style="margin:14px 0 12px;font-size:34px;line-height:1.1">Your idea has entered the arena.</h1><p style="margin:0 0 26px;color:#56635a;font-size:16px;line-height:1.7">Thank you, ${name}. Your AgriTech Battlefield 2026 application has been received and will be reviewed by the selection team.</p><div style="padding:24px;border-radius:16px;background:#07131f;color:#fff"><div style="color:#93a097;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.3px">Application reference</div><div style="margin-top:7px;color:#baff27;font-family:monospace;font-size:22px;font-weight:800;letter-spacing:1px">${escapeHtml(application.reference_code)}</div><div style="margin-top:20px;color:#93a097;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.3px">Innovation</div><div style="margin-top:5px;font-size:17px">${escapeHtml(application.team_name)}</div></div><p style="margin:24px 0 0;color:#56635a;font-size:14px;line-height:1.7">Applications are reviewed for relevance, originality, feasibility, market potential, impact and scalability. Shortlisted applicants will receive details of the next stage.</p><p style="margin:20px 0 0;font-weight:800">Build It. Defend It. Scale It.</p>`),
  };
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders });

  try {
    const resendKey = Deno.env.get('RESEND_API_KEY');
    const from = Deno.env.get('CONFIRMATION_EMAIL_FROM');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!resendKey || !from || !supabaseUrl || !serviceRoleKey) throw new Error('Email delivery is not configured.');

    const { kind, code } = await request.json() as RequestBody;
    if (!kind || !code || !/^(ATF|ATB)-[A-Z0-9]{8,16}$/.test(code)) return Response.json({ error: 'Invalid request' }, { status: 400, headers: corsHeaders });

    const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const recordKey = `${kind}:${code}`;
    const { data: previous } = await admin.from('email_deliveries').select('provider_id,status').eq('record_key', recordKey).eq('status', 'sent').maybeSingle();
    if (previous) return Response.json({ sent: true, duplicate: true, id: previous.provider_id }, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const table = kind === 'ticket' ? 'tickets' : 'battlefield_applications';
    const key = kind === 'ticket' ? 'ticket_code' : 'reference_code';
    const { data: record, error: recordError } = await admin.from(table).select('*').eq(key, code).single();
    if (recordError || !record) return Response.json({ error: 'Registration not found' }, { status: 404, headers: corsHeaders });

    if (kind === 'ticket' && (record.status === 'pending' || record.status === 'cancelled')) return Response.json({ error: 'Ticket is not confirmed' }, { status: 409, headers: corsHeaders });
    if (kind === 'ticket' && record.payment_domain === 'test') return Response.json({ sent: false, test: true }, { headers: corsHeaders });
    const email = kind === 'ticket' ? ticketEmail(record) : battlefieldEmail(record);
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': recordKey },
      body: JSON.stringify({ from, reply_to: 'info@e360.africa', ...email }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result?.message || 'Email provider rejected the message.');

    await admin.from('email_deliveries').upsert({ record_key: recordKey, message_type: kind, recipient: email.to, status: 'sent', provider_id: result.id, sent_at: new Date().toISOString(), error_message: null }, { onConflict: 'record_key' });
    return Response.json({ sent: true, id: result.id }, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return Response.json({ sent: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
