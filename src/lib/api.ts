import { paymentErrorMessage } from './paymentErrors';
import { supabase } from './supabase';

function client() {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
}

async function sendConfirmation(kind: 'ticket' | 'battlefield', code: string) {
  const { data, error } = await client().functions.invoke('send-confirmation', { body: { kind, code } });
  return !error && data?.sent === true;
}

export async function createTicket(input: { full_name: string; email: string; phone?: string; ticket_type: string; attendance_date: string; attendance_dates?: string[]; accessibility_notes?: string; role_designation?: string; looking_forward_to?: string; heard_about?: string }) {
  if (input.ticket_type !== 'Regular pass') throw new Error('Premium passes must use secure checkout.');
  const ticket_code = `ATF-${crypto.randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase()}`;
  const { error } = await client().from('tickets').insert({ ...input, ticket_code });
  if (error) throw error;
  const email_sent = await sendConfirmation('ticket', ticket_code);
  return { ...input, ticket_code, email_sent };
}

export async function submitBattlefieldApplication(answers: Record<string, string | string[] | boolean>, files: Record<string, File[]>) {
  const isEligible = answers.age_eligible === 'Yes' && answers.available === 'Yes' && answers.agriculture_focus === 'Yes';
  if (!isEligible) throw new Error('Applicant does not meet the Battlefield eligibility requirements.');

  const { based_nigeria: _removedLocation, video_url: _removedVideo, video_confirmed: _removedVideoAccess, ...currentAnswers } = answers;
  void _removedLocation; void _removedVideo; void _removedVideoAccess;
  const reference_code = `ATB-${crypto.randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase()}`;
  const document_paths: Record<string, string[]> = {};
  for (const [field, selectedFiles] of Object.entries(files)) {
    document_paths[field] = [];
    for (const file of selectedFiles) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '-');
      const path = `${reference_code}/${field}/${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await client().storage.from('battlefield-applications').upload(path, file, { upsert: false });
      if (uploadError) throw uploadError;
      document_paths[field].push(path);
    }
  }
  const row = {
    reference_code,
    team_name: String(answers.team_name || answers.innovation_name || ''),
    institution: String(answers.institution || ''),
    email: String(answers.email || ''),
    phone: String(answers.phone || ''),
    category: String(answers.category || ''),
    problem: String(answers.problem || ''),
    solution: String(answers.solution || ''),
    stage: String(answers.stage || ''),
    application_data: currentAnswers,
    document_paths,
  };
  const { error } = await client().from('battlefield_applications').insert(row);
  if (error) throw error;
  const email_sent = await sendConfirmation('battlefield', reference_code);
  return { reference_code, email_sent };
}

export async function createEnquiry(input: { enquiry_type: string; name: string; email: string; phone?: string; organisation?: string; subject?: string; message?: string; payload?: Record<string, unknown> }) {
  const { error } = await client().from('enquiries').insert(input);
  if (error) throw error;
}

export async function subscribeToNewsletter(input: { email: string; first_name?: string; organisation?: string; job_title?: string }) {
  const { error } = await client().from('newsletter_subscribers').insert(input);
  if (error && error.code !== '23505') throw error;
}

export type AdminTable = 'pages' | 'programme_days' | 'speakers' | 'exhibitors' | 'partners' | 'tickets' | 'battlefield_applications' | 'enquiries' | 'newsletter_subscribers' | 'newsletters';

export async function getAdminCounts() {
  const tables: AdminTable[] = ['tickets', 'speakers', 'exhibitors', 'battlefield_applications', 'enquiries'];
  const results = await Promise.all(tables.map(async (table) => {
    const { count, error } = await client().from(table).select('*', { count: 'exact', head: true });
    if (error) throw error;
    return [table, count ?? 0] as const;
  }));
  return Object.fromEntries(results) as Record<AdminTable, number>;
}

export type AdminSectionKey = 'pages' | 'programme' | 'speakers' | 'exhibitors' | 'partners' | 'tickets' | 'battlefield' | 'inbox' | 'newsletter';
export type AdminRecord = { id: string; title: string; subtitle: string; meta: string; status: 'Published' | 'Draft' | 'Pending' | 'Approved'; tag?: string };

const sectionTables: Record<AdminSectionKey, string> = {
  pages: 'pages', programme: 'programme_days', speakers: 'speakers', exhibitors: 'exhibitors', partners: 'partners', tickets: 'tickets', battlefield: 'battlefield_applications', inbox: 'enquiries', newsletter: 'newsletters',
};

function displayStatus(value?: string): AdminRecord['status'] {
  if (value === 'published') return 'Published';
  if (value === 'approved' || value === 'confirmed' || value === 'checked_in') return 'Approved';
  if (value === 'pending') return 'Pending';
  return 'Draft';
}

function mapAdminRow(section: AdminSectionKey, row: Record<string, unknown>): AdminRecord {
  const date = row.created_at ? new Date(String(row.created_at)).toLocaleDateString() : '';
  if (section === 'pages') return { id: String(row.id), title: String(row.title), subtitle: String(row.eyebrow || row.slug), meta: `Updated ${date}`, status: displayStatus(String(row.status)) };
  if (section === 'programme') return { id: String(row.id), title: `Day ${String(row.day_number).padStart(2, '0')} · ${row.title}`, subtitle: String(row.theme || ''), meta: String(row.venue || ''), status: displayStatus(String(row.status)), tag: String(row.event_date || '') };
  if (section === 'speakers') return { id: String(row.id), title: String(row.name), subtitle: `${row.job_title || 'Speaker'} · ${row.organisation || ''}`, meta: String(row.category || ''), status: displayStatus(String(row.status)) };
  if (section === 'exhibitors') return { id: String(row.id), title: String(row.name), subtitle: `${row.category || 'Exhibitor'} · Booth ${row.booth || 'TBC'}`, meta: String(row.description || ''), status: displayStatus(String(row.review_status)) };
  if (section === 'partners') return { id: String(row.id), title: String(row.name), subtitle: String(row.tier || 'Partner'), meta: String(row.description || ''), status: displayStatus(String(row.status)) };
  if (section === 'tickets') return { id: String(row.id), title: String(row.full_name), subtitle: `${row.ticket_type} · ${(Array.isArray(row.attendance_dates) ? row.attendance_dates : [row.attendance_date]).filter(Boolean).join(', ') || 'No day selected'} · ${row.ticket_code}`, meta: `${row.email} · ${date}`, status: displayStatus(String(row.status)) };
  if (section === 'battlefield') return { id: String(row.id), title: String(row.team_name), subtitle: `${row.category || 'Innovation'} · ${row.institution || ''}`, meta: String(row.solution || ''), status: displayStatus(String(row.review_status)) };
  if (section === 'inbox') return { id: String(row.id), title: String(row.subject || `${row.enquiry_type} enquiry`), subtitle: `From ${row.name}`, meta: date, status: displayStatus(String(row.status)) };
  return { id: String(row.id), title: String(row.subject), subtitle: String(row.preview_text || ''), meta: date, status: displayStatus(String(row.status)) };
}

export async function loadAdminSection(section: AdminSectionKey): Promise<AdminRecord[]> {
  const { data, error } = await client().from(sectionTables[section]).select('*').order('created_at', { ascending: false }).limit(200);
  if (error) throw error;
  return (data || []).map((row) => mapAdminRow(section, row));
}

export async function addAdminRecord(section: AdminSectionKey, title: string, subtitle: string) {
  const key = crypto.randomUUID().slice(0, 8);
  const payloads: Record<AdminSectionKey, Record<string, unknown>> = {
    pages: { slug: `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${key}`, title, eyebrow: subtitle, status: 'draft' },
    programme: { day_number: Math.floor(Date.now() / 1000) % 30000, title, theme: subtitle, event_date: '2026-11-19', status: 'draft' },
    speakers: { name: title, job_title: subtitle, status: 'draft' },
    exhibitors: { name: title, category: subtitle, review_status: 'pending', is_public: false },
    partners: { name: title, tier: subtitle || 'Partner', status: 'draft' },
    tickets: { full_name: title, email: subtitle, ticket_type: 'Regular pass', attendance_date: '2026-11-17', attendance_dates: ['2026-11-17'], ticket_code: `ATF-${key.toUpperCase()}`, status: 'pending' },
    battlefield: { team_name: title, email: subtitle, review_status: 'pending' },
    inbox: { enquiry_type: 'contact', name: title, email: subtitle, status: 'pending' },
    newsletter: { subject: title, preview_text: subtitle, status: 'draft' },
  };
  const { error } = await client().from(sectionTables[section]).insert(payloads[section]);
  if (error) throw error;
}

export async function deleteAdminRecord(section: AdminSectionKey, id: string) {
  const { error } = await client().from(sectionTables[section]).delete().eq('id', id);
  if (error) throw error;
}

export async function updateAdminRecordStatus(section: AdminSectionKey, id: string, status: AdminRecord['status']) {
  const statusColumn = ['exhibitors', 'battlefield', 'inbox'].includes(section) ? 'review_status' : 'status';
  let value = status.toLowerCase();
  if (section === 'tickets') value = status === 'Approved' ? 'confirmed' : status === 'Pending' ? 'pending' : 'cancelled';
  const { error } = await client().from(sectionTables[section]).update({ [statusColumn]: value }).eq('id', id);
  if (error) throw error;
}

export async function premiumPayment(body: Record<string, unknown>): Promise<{ authorization_url?: string; reference?: string; ticket?: import('../components/TicketPass').TicketPassData; test?: boolean }> {
  const { data, error } = await client().functions.invoke('paystack', { body });
  if (error) {
    throw new Error(await paymentErrorMessage(error));
  }
  if (data?.error) throw new Error(data.error);
  return data;
}
