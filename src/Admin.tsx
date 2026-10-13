import Submissions from './admin/Submissions';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  Bell, CalendarDays, Check, Eye, FileText,
  Gauge, Handshake, LayoutDashboard, Mail, Menu, MessageSquare,
  Pencil, Plus, Search, Settings, Store, Ticket, Trash2, Trophy, UserRound,
  Users, X, ScanLine, ShieldCheck,
} from 'lucide-react';
import './admin.css';
import './admin-mobile.css';
import './admin-desktop.css';
import { supabase } from './lib/supabase';
import { addAdminRecord, deleteAdminRecord, getAdminCounts, loadAdminSection, updateAdminRecordStatus, type AdminSectionKey, type AdminTable } from './lib/api';
import CheckInPanel from './admin/CheckInPanel';
import TeamPanel from './admin/TeamPanel';
import SiteMaintenanceControl from './components/SiteMaintenanceControl';

type AdminSection = 'overview' | 'pages' | 'programme' | 'speakers' | 'exhibitors' | 'partners' | 'tickets' | 'checkin' | 'battlefield' | 'inbox' | 'newsletter' | 'team' | 'settings';
type RecordRow = { id: string; title: string; subtitle: string; meta: string; status: 'Published' | 'Draft' | 'Pending' | 'Approved'; tag?: string };

const nav: { section: AdminSection; label: string; icon: typeof Gauge }[] = [
  { section: 'overview', label: 'Overview', icon: LayoutDashboard },
  { section: 'pages', label: 'Pages & content', icon: FileText },
  { section: 'programme', label: 'Programme', icon: CalendarDays },
  { section: 'speakers', label: 'Speakers', icon: UserRound },
  { section: 'exhibitors', label: 'Exhibitors', icon: Store },
  { section: 'partners', label: 'Partners', icon: Handshake },
  { section: 'tickets', label: 'Tickets', icon: Ticket },
  { section: 'checkin', label: 'Registration desk', icon: ScanLine },
  { section: 'battlefield', label: 'Battlefield', icon: Trophy },
  { section: 'inbox', label: 'Inbox', icon: MessageSquare },
  { section: 'newsletter', label: 'Newsletter', icon: Mail },
  { section: 'team', label: 'Team & permissions', icon: ShieldCheck },
  { section: 'settings', label: 'Site settings', icon: Settings },
];

const emptyRows: Record<Exclude<AdminSection, 'overview' | 'settings' | 'checkin' | 'team'>, RecordRow[]> = {
  pages: [], programme: [], speakers: [], exhibitors: [], partners: [], tickets: [], battlefield: [], inbox: [], newsletter: [],
};

const titles: Record<AdminSection, [string, string]> = {
  overview: ['Welcome back, Admin', 'Here is what is happening across AgriTech Fest.'],
  pages: ['Pages & content', 'Manage the words and sections visitors see across the website.'],
  programme: ['Programme', 'Build the three-day schedule, sessions and venues.'],
  speakers: ['Speakers', 'Manage profiles, roles and programme appearances.'],
  exhibitors: ['Exhibitors', 'Review companies, categories and booth assignments.'],
  partners: ['Partners', 'Manage sponsor tiers, logos and visibility.'],
  tickets: ['Tickets', 'Track registrations, passes and event check-in.'],
  checkin: ['Registration desk', 'Scan passes, verify attendees and manage the live guest list.'],
  battlefield: ['Battlefield', 'Review applications and move teams through selection.'],
  inbox: ['Inbox', 'Manage contact, enterprise, exhibition, sponsor, media and mixer enquiries.'],
  newsletter: ['Newsletter', 'Manage subscribers and event communications.'],
  team: ['Team & permissions', 'Give each event team member access to exactly what they need.'],
  settings: ['Site settings', 'Control event details, visibility and publishing.'],
};

function loadRows() {
  return emptyRows;
}

function Status({ value }: { value: RecordRow['status'] }) {
  return <span className={`admin-status status-${value.toLowerCase()}`}><i />{value}</span>;
}

export default function Admin() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!supabase) { setChecking(false); return; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setChecking(false); });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, []);

  if (checking) return <div className="admin-auth"><div className="auth-card"><p>Connecting securely…</p></div></div>;
  if (!session) return <AdminLogin />;
  return <AdminAccess session={session} />;
}

type AccessProfile = { display_name: string; role: string; permissions: string[]; is_active: boolean };

function AdminAccess({ session }: { session: Session }) {
  const [profile, setProfile] = useState<AccessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase?.from('admin_users').select('display_name,role,permissions,is_active').eq('user_id', session.user.id).maybeSingle()
      .then(({ data }) => { setProfile(data as AccessProfile | null); setLoading(false); });
  }, [session.user.id]);
  if (loading) return <div className="admin-auth"><div className="auth-card"><p>Checking permissions…</p></div></div>;
  if (!profile || !profile.is_active) return <div className="admin-auth"><div className="auth-card"><ShieldCheck size={34}/><span>ACCESS REQUIRED</span><h1>Account not authorised</h1><p>This email is signed in, but it has not been added to the AgriTech Fest team or its access has been paused.</p><button className="admin-primary" onClick={() => supabase?.auth.signOut()}>Sign out</button></div></div>;
  return <AdminDashboard session={session} profile={profile} />;
}

function AdminLogin() {
  const [createMode, setCreateMode] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setMessage('');
    const data = new FormData(event.currentTarget);
    const email = String(data.get('email')).toLowerCase();
    const password = String(data.get('password'));
    if (!supabase) { setMessage('Supabase is not configured.'); setBusy(false); return; }
    const result = createMode
      ? await supabase.auth.signUp({ email, password, options: { data: { display_name: 'Admin Office' } } })
      : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (result.error) setMessage(result.error.message);
    else if (createMode && !result.data.session) setMessage(`Check ${email} for the confirmation link, then sign in.`);
  };
  return <div className="admin-auth"><form className="auth-card" onSubmit={submit}><img src="/assets/images/LOGO_DARK_.png" alt="AgriTech Fest" /><span>ADMIN CONSOLE</span><h1>{createMode ? 'Create team access' : 'Welcome back'}</h1><p>Use an email address authorised by the event administrator.</p><label>Email<input name="email" type="email" required placeholder="you@organisation.com" /></label><label>Password<input name="password" type="password" minLength={8} required placeholder="Enter your password" /></label><button className="admin-primary" disabled={busy}>{busy ? 'Please wait…' : createMode ? 'Create account' : 'Sign in'}</button>{message && <div className="auth-message">{message}</div>}<button type="button" className="auth-switch" onClick={() => { setCreateMode(!createMode); setMessage(''); }}>{createMode ? 'Already have access? Sign in' : 'First time here? Create team access'}</button></form></div>;
}

function AdminDashboard({ session, profile }: { session: Session; profile: AccessProfile }) {
  const [section, setSection] = useState<AdminSection>('overview');
  const [rows, setRows] = useState(loadRows);
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState('');

  const isAdmin = profile.role === 'admin';
  const canAccess = (item: AdminSection) => isAdmin || item === 'overview' || (item === 'checkin' ? profile.permissions.includes('tickets') : profile.permissions.includes(item));
  const visibleNav = nav.filter((item) => canAccess(item.section));

  useEffect(() => {
    if (section === 'overview' || section === 'settings' || section === 'checkin' || section === 'team' || ['tickets', 'battlefield', 'inbox', 'newsletter'].includes(section)) return;
    loadAdminSection(section as AdminSectionKey).then((data) => setRows((current) => ({ ...current, [section]: data }))).catch((error) => setToast(`Could not load records: ${error.message}`));
  }, [section]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 2600); return () => clearTimeout(timer); }, [toast]);

  const filtered = useMemo(() => {
    const activeRows = section !== 'overview' && section !== 'settings' && section !== 'checkin' && section !== 'team' ? rows[section] : [];
    return activeRows.filter((row) => `${row.title} ${row.subtitle} ${row.meta}`.toLowerCase().includes(query.toLowerCase()));
  }, [rows, section, query]);
  const go = (next: AdminSection) => { setSection(next); setQuery(''); setMenuOpen(false); };
  const saveNew = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (section === 'overview' || section === 'settings' || section === 'checkin' || section === 'team') return;
    const data = new FormData(event.currentTarget);
    try {
      await addAdminRecord(section as AdminSectionKey, String(data.get('title')), String(data.get('subtitle')));
      const fresh = await loadAdminSection(section as AdminSectionKey);
      setRows((current) => ({ ...current, [section]: fresh }));
      setModal(false); setToast('Draft added successfully');
    } catch (error) { setToast(`Could not add item: ${(error as Error).message}`); }
  };
  const remove = async (id: string) => {
    if (section === 'overview' || section === 'settings' || section === 'checkin' || section === 'team') return;
    try { await deleteAdminRecord(section as AdminSectionKey, id); setRows((current) => ({ ...current, [section]: current[section].filter((row) => row.id !== id) })); setToast('Item moved to trash'); }
    catch (error) { setToast(`Could not delete item: ${(error as Error).message}`); }
  };

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="admin-brand"><img src="/assets/images/LOGO_BRIGHT_.png" alt="AgriTech Fest" /><button onClick={() => setMenuOpen(false)}><X /></button></div>
        <div className="admin-event"><span>Current event</span><strong>AgriTech Fest 2026</strong><small>17–19 November · Kano</small></div>
        <nav>{visibleNav.map(({ section: item, label, icon: Icon }) => <button className={section === item ? 'active' : ''} key={item} onClick={() => go(item)}><Icon size={18} /><span>{label}</span></button>)}</nav>
        <button className="admin-user" onClick={() => supabase?.auth.signOut()} title="Sign out"><div>{profile.display_name.slice(0,2).toUpperCase()}</div><span><strong>{profile.display_name}</strong><small>{session.user.email}</small></span></button>
      </aside>

      <main className="admin-main">
        <header className="admin-mobile-header">
          <div className="admin-mobile-mark"><img src="/assets/images/LOGO_BRIGHT_.png" alt="" /></div>
          <div className="admin-mobile-greeting"><small>AgriTech Fest Admin</small><strong>Hey, {profile.display_name.split(' ')[0]}</strong></div>
          <div className="admin-mobile-header-actions">
            <button onClick={() => setMobileSearchOpen((open) => !open)} aria-label="Search admin"><Search size={21} /></button>
            <button onClick={() => setMenuOpen(true)} aria-label="Open all admin sections"><Menu size={22} /></button>
          </div>
        </header>
        {mobileSearchOpen && <label className="admin-mobile-search"><Search size={17} /><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search this section…" /></label>}
        <header className="admin-topbar">
          <button className="admin-menu" onClick={() => setMenuOpen(true)}><Menu /></button>
          <div className="admin-search"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search this section…" /></div>
          <button className="admin-icon-button" aria-label="Notifications"><Bell size={19} /><i /></button>
          <button className="admin-view" onClick={() => window.open('/', '_blank')}><Eye size={17} /> View website</button>
        </header>

        <div className="admin-content">
          <div className="admin-heading"><div><p>ADMIN CONSOLE / {section.toUpperCase()}</p><h1>{titles[section][0]}</h1><span>{titles[section][1]}</span></div>{!['overview','settings','checkin','team','tickets','battlefield','inbox','newsletter'].includes(section) && <button className="admin-primary" onClick={() => setModal(true)}><Plus size={17} /> Add new</button>}</div>

          {section === 'overview' && <Overview onNavigate={go} />}
          {(section === 'battlefield' || section === 'inbox' || section === 'newsletter' || section === 'tickets') && <Submissions key={section} section={section} query={query} />}
          {section === 'checkin' && <CheckInPanel />}
          {section === 'team' && <TeamPanel />}
          {section === 'settings' && <SettingsPanel notify={setToast} />}
          {!['overview','settings','checkin','team','tickets','battlefield','inbox','newsletter'].includes(section) && <DataPanel section={section} rows={filtered} remove={remove} update={async (id, status) => { try { await updateAdminRecordStatus(section as AdminSectionKey, id, status); setRows((current) => ({ ...current, [section]: current[section as AdminSectionKey].map((row: RecordRow) => row.id === id ? { ...row, status } : row) })); setToast(`Status changed to ${status}`); } catch (error) { setToast(`Could not update status: ${(error as Error).message}`); } }} />}
        </div>
      </main>

      <nav className="admin-mobile-nav" aria-label="Mobile admin navigation">
        {[
          ['overview', LayoutDashboard, 'Overview'],
          ['tickets', Ticket, 'Tickets'],
          ['checkin', ScanLine, 'Registration desk'],
          ['battlefield', Trophy, 'Battlefield'],
          ['team', UserRound, 'Team'],
        ].map(([item, Icon, label]) => canAccess(item as AdminSection) && (
          <button key={String(item)} className={section === item ? 'active' : ''} onClick={() => go(item as AdminSection)} aria-label={String(label)} aria-current={section === item ? 'page' : undefined}>
            <Icon size={21} />
          </button>
        ))}
      </nav>
      {modal && <div className="admin-modal-backdrop" onMouseDown={() => setModal(false)}><form className="admin-modal" onSubmit={saveNew} onMouseDown={(e) => e.stopPropagation()}><div><span>NEW {section.toUpperCase()}</span><button type="button" onClick={() => setModal(false)}><X /></button></div><h2>Add to {titles[section][0]}</h2><label>Title<input name="title" required autoFocus placeholder="Enter a clear title" /></label><label>Details<input name="subtitle" required placeholder="Role, category or short description" /></label><label>Notes<textarea name="notes" rows={4} placeholder="Optional internal notes" /></label><footer><button type="button" onClick={() => setModal(false)}>Cancel</button><button className="admin-primary" type="submit">Save draft</button></footer></form></div>}
      {toast && <div className="admin-toast"><Check size={17} />{toast}</div>}
    </div>
  );
}

function Overview({ onNavigate }: { onNavigate: (section: AdminSection) => void }) {
  const [counts, setCounts] = useState<Record<AdminTable, number> | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { getAdminCounts().then(setCounts).catch((failure) => setError(failure instanceof Error ? failure.message : 'Live totals could not be loaded.')); }, []);
  const stats = counts ? [
    [counts.tickets, 'Tickets', Ticket, 'tickets'],
    [counts.speakers, 'Speakers', Users, 'speakers'],
    [counts.exhibitors, 'Exhibitors', Store, 'exhibitors'],
    [counts.battlefield_applications, 'Battlefield applications', Trophy, 'battlefield'],
    [counts.enquiries, 'Enquiries', MessageSquare, 'inbox'],
  ] as const : [];
  if (error) return <section className="admin-card admin-empty"><h2>Live overview unavailable</h2><p>{error}</p></section>;
  if (!counts) return <section className="admin-card admin-empty"><p role="status">Loading live records…</p></section>;
  return <section className="admin-stats" aria-label="Live database totals">{stats.map(([value, label, Icon, target]) => <button key={label} onClick={() => onNavigate(target)}><div><Icon size={20} /></div><strong>{value.toLocaleString()}</strong><span>{label}</span><small>Live Supabase total</small></button>)}</section>;
}

function DataPanel({ section, rows, remove, update }: { section: AdminSection; rows: RecordRow[]; remove: (id: string) => void | Promise<void>; update: (id: string, status: RecordRow['status']) => void | Promise<void> }) {
  return <section className="admin-card admin-table"><header><div><span>{rows.length} RECORDS</span><h2>{titles[section][0]}</h2></div><button className="filter-button"><Gauge size={16} /> Filter</button></header>{rows.length === 0 ? <div className="admin-empty"><Search size={28} /><h3>No results found</h3><p>Try another search term.</p></div> : rows.map((row) => <article className="admin-row" key={row.id}><div className="row-avatar">{row.title.slice(0, 2).toUpperCase()}</div><div className="row-copy"><strong>{row.title}</strong><span>{row.subtitle}</span></div>{row.tag && <time>{row.tag}</time>}<small>{row.meta}</small><Status value={row.status} /><div className="row-actions"><button title="Edit" onClick={() => update(row.id, row.status === 'Published' || row.status === 'Approved' ? 'Draft' : section === 'pages' || section === 'programme' || section === 'speakers' || section === 'newsletter' ? 'Published' : 'Approved')}><Pencil size={16} /></button><button title="Delete" onClick={() => remove(row.id)}><Trash2 size={16} /></button></div></article>)}</section>;
}

function SettingsPanel({ notify }: { notify: (message: string) => void }) {
  return <div className="settings-grid"><section className="admin-card settings-form"><header><div><span>EVENT INFORMATION</span><h2>Core details</h2></div></header><label>Event name<input defaultValue="AgriTech Fest 2026" /></label><div className="field-pair"><label>Start date<input type="date" defaultValue="2026-11-17" /></label><label>End date<input type="date" defaultValue="2026-11-19" /></label></div><label>Location<input defaultValue="Kano, Nigeria" /></label><label>Contact email<input type="email" defaultValue="info@e360.africa" /></label><button className="admin-primary" onClick={() => notify('Event settings saved')}>Save changes</button></section><section><SiteMaintenanceControl /></section></div>;
}


