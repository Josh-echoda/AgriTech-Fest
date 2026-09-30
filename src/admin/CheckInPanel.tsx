import { useEffect, useMemo, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, Check, CircleAlert, RefreshCw, Search, UserCheck, Users, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './operations.css';

type TicketRecord = {
  id: string; ticket_code: string; full_name: string; email: string; phone: string | null;
  ticket_type: string; attendance_date: string; attendance_dates?: string[]; status: 'pending' | 'confirmed' | 'checked_in' | 'cancelled'; checked_in_at: string | null; created_at: string;
};

const cleanCode = (raw: string) => raw.trim().replace(/^AGRITECH-FEST-2026:/i, '').toUpperCase();

const formatAttendanceDays = (ticket: TicketRecord, compact = false) => {
  const days = ticket.attendance_dates?.length ? ticket.attendance_dates : [ticket.attendance_date];
  return days.map(day => new Date(`${day}T12:00:00`).toLocaleDateString(undefined, compact ? { month: 'short', day: 'numeric' } : { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })).join(' · ');
};

export default function CheckInPanel() {
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<TicketRecord | null>(null);
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scanner = useRef<Html5QrcodeScanner | null>(null);

  const load = async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase.from('tickets').select('*').order('created_at', { ascending: false }).limit(1000);
    setLoading(false);
    if (error) setMessage(error.message); else setTickets((data || []) as TicketRecord[]);
  };
  useEffect(() => { load(); }, []);
  useEffect(() => () => { scanner.current?.clear().catch(() => undefined); }, []);

  const todayChecked = tickets.filter((ticket) => ticket.status === 'checked_in').length;
  const filtered = useMemo(() => tickets.filter((ticket) => `${ticket.full_name} ${ticket.email} ${ticket.ticket_code}`.toLowerCase().includes(query.toLowerCase())).slice(0, 50), [tickets, query]);

  const verify = async (raw: string) => {
    const code = cleanCode(raw);
    const found = tickets.find((ticket) => ticket.ticket_code.toUpperCase() === code);
    setSelected(found || null);
    setMessage(found ? '' : `No valid ticket found for “${code}”.`);
    if (found && scanning) await stopScanner();
  };
  const startScanner = () => {
    setScanning(true); setMessage('');
    requestAnimationFrame(() => {
      const instance = new Html5QrcodeScanner('admin-qr-reader', { fps: 10, qrbox: { width: 250, height: 250 }, rememberLastUsedCamera: true }, false);
      scanner.current = instance;
      instance.render((text) => verify(text), () => undefined);
    });
  };
  const stopScanner = async () => { await scanner.current?.clear().catch(() => undefined); scanner.current = null; setScanning(false); };
  const checkIn = async () => {
    if (!supabase || !selected || selected.status === 'checked_in') return;
    const checked_in_at = new Date().toISOString();
    const { error } = await supabase.from('tickets').update({ status: 'checked_in', checked_in_at }).eq('id', selected.id).eq('status', 'confirmed');
    if (error) { setMessage(error.message); return; }
    const updated = { ...selected, status: 'checked_in' as const, checked_in_at };
    setSelected(updated); setTickets((items) => items.map((item) => item.id === updated.id ? updated : item)); setMessage('Attendee checked in successfully.');
  };

  return <div className="checkin-layout">
    <section className="checkin-hero admin-card"><div><span>REGISTRATION DESK</span><h2>Fast, confident check-in.</h2><p>Scan the attendee’s QR code or search the guest list. Every pass can only be checked in once.</p></div><div className="checkin-metrics"><div><Users /><strong>{tickets.length}</strong><span>Registered</span></div><div><UserCheck /><strong>{todayChecked}</strong><span>Checked in</span></div><div><CircleAlert /><strong>{tickets.length - todayChecked}</strong><span>Expected</span></div></div></section>
    <section className="checkin-grid"><article className="admin-card scanner-card"><header><div><span>QR VERIFICATION</span><h2>Scan attendee pass</h2></div>{scanning && <button onClick={stopScanner}><X size={17} /> Stop</button>}</header>{scanning ? <div id="admin-qr-reader" /> : <button className="scanner-launch" onClick={startScanner}><Camera size={34} /><strong>Open camera scanner</strong><span>Works with the QR on every confirmed ticket</span></button>}<div className="manual-code"><span>OR ENTER TICKET CODE</span><form onSubmit={(e) => { e.preventDefault(); const data = new FormData(e.currentTarget); verify(String(data.get('code'))); }}><input name="code" placeholder="ATF-XXXXXXXXXX" /><button className="admin-primary">Verify</button></form></div></article>
      <article className={`admin-card verification-card ${selected ? 'has-result' : ''}`}><header><div><span>VERIFICATION RESULT</span><h2>{selected ? 'Ticket found' : 'Ready to verify'}</h2></div></header>{selected ? <><div className={`verify-icon ${selected.status}`}><Check /></div><h3>{selected.full_name}</h3><p>{selected.ticket_type}</p><dl><div><dt>Ticket code</dt><dd>{selected.ticket_code}</dd></div><div><dt>Email</dt><dd>{selected.email}</dd></div><div><dt>Attendance day</dt><dd>{formatAttendanceDays(selected)}</dd></div><div><dt>Status</dt><dd className={`ticket-state ${selected.status}`}>{selected.status.replace('_', ' ')}</dd></div>{selected.checked_in_at && <div><dt>Checked in</dt><dd>{new Date(selected.checked_in_at).toLocaleString()}</dd></div>}</dl>{selected.status === 'confirmed' && <button className="checkin-confirm" onClick={checkIn}><UserCheck size={19} /> Confirm check-in</button>}{selected.status === 'checked_in' && <div className="already-checked"><CircleAlert size={18} /> This pass has already been used.</div>}<button className="clear-result" onClick={() => { setSelected(null); setMessage(''); }}>Check another attendee</button></> : <div className="verify-empty"><Camera size={30} /><p>Scan a QR code or enter a ticket code to see attendee details.</p></div>}{message && <div className="checkin-message">{message}</div>}</article></section>
    <section className="admin-card guest-list"><header><div><span>LIVE GUEST LIST</span><h2>Registered attendees</h2></div><button onClick={load}><RefreshCw size={16} /> Refresh</button></header><div className="guest-search"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email or ticket code" /></div>{loading ? <p>Loading guest list…</p> : filtered.map((ticket) => <button className="guest-row" key={ticket.id} onClick={() => setSelected(ticket)}><div>{ticket.full_name.slice(0,2).toUpperCase()}</div><span><strong>{ticket.full_name}</strong><small>{ticket.email}</small></span><code>{ticket.ticket_code}</code><em>{ticket.ticket_type}<small>{formatAttendanceDays(ticket, true)}</small></em><b className={`ticket-state ${ticket.status}`}>{ticket.status.replace('_',' ')}</b></button>)}</section>
  </div>;
}

