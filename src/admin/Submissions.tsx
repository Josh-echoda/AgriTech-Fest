import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import './submissions.css';

const sources = {
  battlefield: { table: 'battlefield_applications', status: 'review_status', states: ['pending', 'approved', 'rejected'] },
  inbox: { table: 'enquiries', status: 'status', states: ['pending', 'approved', 'rejected'] },
  newsletter: { table: 'newsletter_subscribers', status: 'subscribed', states: ['subscribed', 'unsubscribed'] },
  tickets: { table: 'tickets', status: 'status', states: ['pending', 'confirmed', 'checked_in', 'cancelled'] },
} as const;
type Section = keyof typeof sources;
type Row = Record<string, unknown> & { id: string };
const label = (key: string) => key.replace(/_/g, ' ');
function Value({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === '') return <span>—</span>;
  if (Array.isArray(value)) return <ul>{value.map((item, index) => <li key={index}><Value value={item} /></li>)}</ul>;
  if (typeof value === 'object') return <dl>{Object.entries(value).map(([key, item]) => <div key={key}><dt>{label(key)}</dt><dd><Value value={item} /></dd></div>)}</dl>;
  return <span>{String(value)}</span>;
}
export default function Submissions({ section, query }: { section: Section; query: string }) {
  const config = sources[section];
  const [rows, setRows] = useState<Row[]>([]);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [version, setVersion] = useState(0);
  const [filter, setFilter] = useState('');
  const [documents, setDocuments] = useState<Record<string, string>>({});
  useEffect(() => { setPage(0); }, [filter, query]);
  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true); setError('');
      if (!supabase) { setError('Supabase is not configured.'); setLoading(false); return; }
      let request = supabase.from(config.table).select('*', { count: 'exact' }).order('created_at', { ascending: false });
      if (filter) request = request.eq(config.status, section === 'newsletter' ? filter === 'subscribed' : filter);
      if (query.trim()) {
        const term = '%' + query.trim().replace(/[%_]/g, '') + '%';
        request = request.ilike('email', term);
      }
      const { data, error: failure, count: total } = await request.range(page * 25, page * 25 + 24);
      if (!active) return;
      if (failure) { setRows([]); setError(failure.message); }
      else { setRows((data ?? []) as Row[]); setCount(total ?? 0); }
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, [config, section, page, filter, query, version]);
  async function update(row: Row, values: Record<string, unknown>) {
    if (!supabase || busy) return;
    setBusy(row.id); setError('');
    try {
      const { error: failure } = await supabase.from(config.table).update(values).eq('id', row.id).select('id').single();
      if (failure) throw failure;
      setVersion(v => v + 1);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Could not save changes.'); }
    finally { setBusy(''); }
  }
  async function remove(row: Row) {
    if (!supabase || busy || !window.confirm('Permanently delete this submission? This cannot be undone.')) return;
    setBusy(row.id); setError('');
    const { error: failure } = await supabase.from(config.table).delete().eq('id', row.id).select('id').single();
    if (failure) setError(failure.message);
    else { if (rows.length === 1 && page > 0) setPage(page - 1); setVersion(v => v + 1); }
    setBusy('');
  }
  async function prepareDocument(path: string) {
    if (!supabase) return;
    const { data, error: failure } = await supabase.storage.from('battlefield-applications').createSignedUrl(path, 300);
    if (failure) setError(failure.message);
    else setDocuments(current => ({ ...current, [path]: data.signedUrl }));
  }
  return <section className="submission-manager admin-card">
    <header><div><h2>{section === 'newsletter' ? 'Newsletter subscribers' : 'Submitted records'}</h2><p>{count} records · Search by email using the search box above.</p></div>
      <select aria-label="Filter by status" value={filter} onChange={e => setFilter(e.target.value)}><option value="">All statuses</option>{config.states.map(state => <option key={state}>{state}</option>)}</select>
      <button onClick={() => setVersion(v => v + 1)}>Refresh</button></header>
    {error && <p role="alert">{error}</p>}
    {loading ? <p role="status">Loading submissions…</p> : rows.length === 0 ? <p>No submissions match this view.</p> : rows.map(row => {
      const status = section === 'newsletter' ? row.subscribed ? 'subscribed' : 'unsubscribed' : String(row[config.status]);
      return <details key={row.id} className="submission-record">
        <summary><strong>{String(row.team_name || row.full_name || row.name || row.email)}</strong><span>{String(row.email || '')}</span><span>{String(row.subject || row.enquiry_type || row.ticket_type || '')}</span><b>{status}</b></summary>
        <div className="submission-body">
          <label>Status<select disabled={!!busy} value={status} onChange={e => void update(row, { [config.status]: section === 'newsletter' ? e.target.value === 'subscribed' : e.target.value })}>{config.states.map(state => <option key={state}>{state}</option>)}</select></label>
          <dl>{Object.entries(row).filter(([key]) => key !== 'document_paths').map(([key, value]) => <div key={key}><dt>{label(key)}</dt><dd><Value value={value} /></dd></div>)}</dl>
          {section === 'battlefield' && <>
            <h3>Uploaded documents</h3>
            {Object.entries((row.document_paths || {}) as Record<string, string[]>).map(([field, paths]) => <div key={field}><b>{label(field)}</b>{paths.map(path => <div key={path}>{documents[path] ? <a href={documents[path]} target="_blank" rel="noreferrer">Open {path.split('/').pop()}</a> : <button onClick={() => void prepareDocument(path)}>Prepare secure link: {path.split('/').pop()}</button>}</div>)}</div>)}
            <form onSubmit={e => { e.preventDefault(); const form = new FormData(e.currentTarget); void update(row, { internal_notes: String(form.get('notes') || ''), score: form.get('score') === '' ? null : Number(form.get('score')) }); }}>
              <label>Internal review notes<textarea name="notes" defaultValue={String(row.internal_notes || '')} rows={4} /></label>
              <label>Score<input name="score" type="number" step="0.01" min="0" max="100" defaultValue={row.score == null ? '' : String(row.score)} /></label>
              <button disabled={!!busy}>Save review</button>
            </form>
          </>}
          <button disabled={!!busy} onClick={() => void remove(row)}>Delete submission</button>
        </div>
      </details>;
    })}
    <footer><button disabled={page === 0 || loading} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page + 1} of {Math.max(1, Math.ceil(count / 25))}</span><button disabled={(page + 1) * 25 >= count || loading} onClick={() => setPage(page + 1)}>Next</button></footer>
  </section>;
}
