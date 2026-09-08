import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  Bell, CalendarDays, Check, CircleDollarSign, Eye, FileText,
  Gauge, Handshake, LayoutDashboard, Mail, Menu, MessageSquare, MoreHorizontal,
  Pencil, Plus, Search, Settings, Store, Ticket, Trash2, Trophy, UserRound,
  Users, X, ScanLine, ShieldCheck,
} from 'lucide-react';
import './admin.css';
import './admin-mobile.css';
import { supabase } from './lib/supabase';
import { addAdminRecord, deleteAdminRecord, loadAdminSection, updateAdminRecordStatus, type AdminSectionKey } from './lib/api';
import CheckInPanel from './admin/CheckInPanel';
import TeamPanel from './admin/TeamPanel';
import SiteMaintenanceControl from './components/SiteMaintenanceControl';

type AdminSection = 'overview' | 'pages' | 'programme' | 'speakers' | 'exhibitors' | 'partners' | 'tickets' | 'checkin' | 'battlefield' | 'inbox' | 'newsletter' | 'team' | 'settings';
type RecordRow = { id: string; title: string; subtitle: string; meta: string; status: 'Published' | 'Draft' | 'Pending' | 'Approved'; tag?: string };

const nav: { section: AdminSection; label: string; icon: typeof Gauge; badge?: number }[] = [
  { section: 'overview', label: 'Overview', icon: LayoutDashboard },
  { section: 'pages', label: 'Pages & content', icon: FileText },
  { section: 'programme', label: 'Programme', icon: CalendarDays },
  { section: 'speakers', label: 'Speakers', icon: UserRound },
  { section: 'exhibitors', label: 'Exhibitors', icon: Store },
  { section: 'partners', label: 'Partners', icon: Handshake },
  { section: 'tickets', label: 'Tickets', icon: Ticket, badge: 18 },
  { section: 'checkin', label: 'Registration desk', icon: ScanLine },
  { section: 'battlefield', label: 'Battlefield', icon: Trophy, badge: 7 },
  { section: 'inbox', label: 'Inbox', icon: MessageSquare, badge: 5 },
  { section: 'newsletter', label: 'Newsletter', icon: Mail },
  { section: 'team', label: 'Team & permissions', icon: ShieldCheck },
  { section: 'settings', label: 'Site settings', icon: Settings },
];

const initialRows: Record<Exclude<AdminSection, 'overview' | 'settings' | 'checkin' | 'team'>, RecordRow[]> = {
  pages: [
    { id: 'p1', title: 'Home', subtitle: 'Main event landing page', meta: 'Updated 18 min ago', status: 'Published' },
    { id: 'p2', title: 'About AgriTech Fest', subtitle: 'Event purpose and headline numbers', meta: 'Updated 2 days ago', status: 'Published' },
    { id: 'p3', title: 'Get involved', subtitle: 'Routes for startups, partners and media', meta: 'Updated 4 days ago', status: 'Published' },
    { id: 'p4', title: 'Privacy & terms', subtitle: 'Legal information', meta: 'Needs review', status: 'Draft' },
  ],
  programme: [
    { id: 'd1', title: 'Day 01 · Cultivate', subtitle: 'Youth · Innovation · Education', meta: '10 sessions · Dambatta Campus', status: 'Published', tag: '12 Nov' },
    { id: 'd2', title: 'Day 02 · Engineer', subtitle: 'Farmers · Research · Technology', meta: '10 sessions · BUK New Site', status: 'Published', tag: '13 Nov' },
    { id: 'd3', title: 'Day 03 · Scale', subtitle: 'Policy · Investment · Partnership', meta: '11 sessions · Venue pending', status: 'Draft', tag: '14 Nov' },
  ],
  speakers: [
    { id: 's1', title: 'Dr. Amina Bello', subtitle: 'Keynote · Federal Ministry of Agriculture', meta: 'Opening keynote', status: 'Published' },
    { id: 's2', title: 'Musa Ibrahim', subtitle: 'Founder · FarmSense Africa', meta: 'Founder panel', status: 'Published' },
    { id: 's3', title: 'Fatima Yusuf', subtitle: 'Investor · AgriVentures', meta: 'Investment panel', status: 'Published' },
    { id: 's4', title: 'Prof. Tunde Adeyemi', subtitle: 'Research Lead · BUK', meta: 'Awaiting headshot', status: 'Draft' },
  ],
  exhibitors: [
    { id: 'e1', title: 'AgroDrone Systems', subtitle: 'Technology · Booth A12', meta: 'Drone mapping and crop monitoring', status: 'Approved' },
    { id: 'e2', title: 'FarmLink Equipment', subtitle: 'Equipment · Booth B04', meta: 'Smallholder machinery', status: 'Approved' },
    { id: 'e3', title: 'HarvestPay', subtitle: 'Finance · Booth D02', meta: 'Credit, insurance and payments', status: 'Pending' },
  ],
  partners: [
    { id: 'r1', title: 'Sterling Bank', subtitle: 'Headline Partner', meta: 'Primary placement', status: 'Published' },
    { id: 'r2', title: 'MTN', subtitle: 'Official Partner', meta: 'Logo and profile live', status: 'Published' },
    { id: 'r3', title: 'Kano State', subtitle: 'Supporting Partner', meta: 'Agreement in review', status: 'Pending' },
  ],
  tickets: [
    { id: 't1', title: 'Aisha Mohammed', subtitle: 'Student pass · ATF-Q2-18KLA', meta: 'aisha@example.com · 2 Sep 2026', status: 'Approved' },
    { id: 't2', title: 'David Okoro', subtitle: 'Corporate pass · ATF-Y7-92MPD', meta: 'david@example.com · 2 Sep 2026', status: 'Approved' },
    { id: 't3', title: 'Zainab Musa', subtitle: 'Regular pass · ATF-L4-5AQNX', meta: 'zainab@example.com · 1 Sep 2026', status: 'Pending' },
  ],
  battlefield: [
    { id: 'b1', title: 'GreenPulse', subtitle: 'Precision Agriculture · Bayero University', meta: 'Smart irrigation for smallholders', status: 'Pending' },
    { id: 'b2', title: 'ColdBox Africa', subtitle: 'Post-Harvest · ABU Zaria', meta: 'Solar cold storage', status: 'Approved' },
    { id: 'b3', title: 'HerdWatch', subtitle: 'Livestock · KUST', meta: 'Remote herd monitoring', status: 'Pending' },
  ],
  inbox: [
    { id: 'i1', title: 'Sponsorship enquiry · NorthStar Foods', subtitle: 'From Halima Garba', meta: '12 minutes ago', status: 'Pending' },
    { id: 'i2', title: 'Media accreditation · AgriNews Hub', subtitle: 'From Emmanuel Obi', meta: '2 hours ago', status: 'Pending' },
    { id: 'i3', title: 'Accessibility request', subtitle: 'From Maryam Sani', meta: 'Yesterday', status: 'Approved' },
  ],
  newsletter: [
    { id: 'n1', title: 'September programme update', subtitle: '2,148 recipients', meta: '63% opened · Sent 1 Sep', status: 'Published' },
    { id: 'n2', title: 'Speaker announcement', subtitle: 'Audience: All subscribers', meta: 'Scheduled for 8 Sep', status: 'Draft' },
  ],
};

const titles: Record<AdminSection, [string, string]> = {
  overview: ['Good evening, Admin', 'Here is what is happening across AgriTech Fest.'],
  pages: ['Pages & content', 'Manage the words and sections visitors see across the website.'],
  programme: ['Programme', 'Build the three-day schedule, sessions and venues.'],
  speakers: ['Speakers', 'Manage profiles, roles and programme appearances.'],
  exhibitors: ['Exhibitors', 'Review companies, categories and booth assignments.'],
  partners: ['Partners', 'Manage sponsor tiers, logos and visibility.'],
  tickets: ['Tickets', 'Track registrations, passes and event check-in.'],
  checkin: ['Registration desk', 'Scan passes, verify attendees and manage the live guest list.'],
  battlefield: ['Battlefield', 'Review applications and move teams through selection.'],
  inbox: ['Inbox', 'Handle contact, sponsor and media enquiries.'],
  newsletter: ['Newsletter', 'Manage subscribers and event communications.'],
  team: ['Team & permissions', 'Give each event team member access to exactly what they need.'],
  settings: ['Site settings', 'Control event details, visibility and publishing.'],
};

function loadRows() {
  try { return JSON.parse(localStorage.getItem('agritech-admin-rows') || '') as typeof initialRows; } catch { return initialRows; }
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
    if (section === 'overview' || section === 'settings' || section === 'checkin' || section === 'team') return;
    loadAdminSection(section as AdminSectionKey).then((data) => setRows((current) => ({ ...current, [section]: data }))).catch((error) => setToast(`Could not load records: ${error.message}`));
  }, [section]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 2600); return () => clearTimeout(timer); }, [toast]);

  const activeRows = section !== 'overview' && section !== 'settings' && section !== 'checkin' && section !== 'team' ? rows[section] : [];
  const filtered = useMemo(() => activeRows.filter((row) => `${row.title} ${row.subtitle} ${row.meta}`.toLowerCase().includes(query.toLowerCase())), [activeRows, query]);
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
        <div className="admin-event"><span>Current event</span><strong>AgriTech Fest 2026</strong><small>12–14 November · Kano</small></div>
        <nav>{visibleNav.map(({ section: item, label, icon: Icon, badge }) => <button className={section === item ? 'active' : ''} key={item} onClick={() => go(item)}><Icon size={18} /><span>{label}</span>{badge && <b>{badge}</b>}</button>)}</nav>
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
          <div className="admin-heading"><div><p>ADMIN CONSOLE / {section.toUpperCase()}</p><h1>{titles[section][0]}</h1><span>{titles[section][1]}</span></div>{!['overview','settings','checkin','team'].includes(section) && <button className="admin-primary" onClick={() => setModal(true)}><Plus size={17} /> Add new</button>}</div>

          {section === 'overview' && <Overview onNavigate={go} />}
          {section === 'checkin' && <CheckInPanel />}
          {section === 'team' && <TeamPanel />}
          {section === 'settings' && <SettingsPanel notify={setToast} />}
          {!['overview','settings','checkin','team'].includes(section) && <DataPanel section={section} rows={filtered} remove={remove} update={async (id, status) => { try { await updateAdminRecordStatus(section as AdminSectionKey, id, status); setRows((current) => ({ ...current, [section]: current[section as AdminSectionKey].map((row: RecordRow) => row.id === id ? { ...row, status } : row) })); setToast(`Status changed to ${status}`); } catch (error) { setToast(`Could not update status: ${(error as Error).message}`); } }} />}
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
  const stats = [
    ['2,148', 'Tickets issued', '+184 this week', Ticket, 'tickets'],
    ['34', 'Speakers confirmed', '6 awaiting details', Users, 'speakers'],
    ['27', 'Exhibitors approved', '9 spaces remaining', Store, 'exhibitors'],
    ['42', 'Battlefield entries', '7 need review', Trophy, 'battlefield'],
    ['5', 'New enquiries', 'Needs attention', MessageSquare, 'inbox'],
    ['76%', 'Event readiness', 'Launch checklist', Gauge, 'programme'],
  ] as const;
  return <>
    <section className="admin-stats">{stats.map(([value, label, note, Icon, target]) => <button className={label === 'New enquiries' || label === 'Event readiness' ? 'mobile-only-stat' : ''} key={label} onClick={() => onNavigate(target)}><div><Icon size={20} /></div><strong>{value}</strong><span>{label}</span><small>{note}</small></button>)}</section>
    <section className="admin-overview-grid">
      <article className="admin-card admin-sales"><header><div><span>REGISTRATION</span><h2>Ticket activity</h2></div><select aria-label="Chart range"><option>Last 7 days</option><option>Last 30 days</option></select></header><div className="chart-wrap"><div className="chart-y"><span>300</span><span>200</span><span>100</span><span>0</span></div><div className="bar-chart">{[38, 52, 47, 68, 58, 84, 73].map((height, i) => <div key={i}><i style={{ height: `${height}%` }} /><span>{['Thu','Fri','Sat','Sun','Mon','Tue','Wed'][i]}</span></div>)}</div></div></article>
      <article className="admin-card admin-progress"><header><div><span>EVENT READINESS</span><h2>Launch checklist</h2></div><b>76%</b></header><div className="progress-track"><i /></div>{[['Programme published', true], ['Speaker profiles', true], ['Venue confirmation', false], ['Sponsor assets', true], ['Check-in team briefing', false]].map(([label, done]) => <div className="check-row" key={String(label)}><i className={done ? 'done' : ''}>{done && <Check size={12} />}</i><span>{label}</span></div>)}</article>
    </section>
    <section className="admin-overview-grid lower"><article className="admin-card"><header><div><span>NEEDS ATTENTION</span><h2>Pending reviews</h2></div><button onClick={() => onNavigate('inbox')}>View all</button></header>{[['7', 'Battlefield applications', 'battlefield'], ['5', 'New enquiries', 'inbox'], ['3', 'Exhibitor applications', 'exhibitors']].map(([n,label,target]) => <button className="attention-row" onClick={() => onNavigate(target as AdminSection)} key={label}><b>{n}</b><span>{label}</span><MoreHorizontal size={18} /></button>)}</article><article className="admin-card"><header><div><span>REVENUE SNAPSHOT</span><h2>Ticket value</h2></div><CircleDollarSign size={22} /></header><strong className="revenue">₦18.4m</strong><p>Across corporate and regular registrations</p><div className="revenue-split"><span><i />Corporate <b>₦12.8m</b></span><span><i />Regular <b>₦5.6m</b></span></div></article></section>
  </>;
}

function DataPanel({ section, rows, remove, update }: { section: AdminSection; rows: RecordRow[]; remove: (id: string) => void | Promise<void>; update: (id: string, status: RecordRow['status']) => void | Promise<void> }) {
  return <section className="admin-card admin-table"><header><div><span>{rows.length} RECORDS</span><h2>{titles[section][0]}</h2></div><button className="filter-button"><Gauge size={16} /> Filter</button></header>{rows.length === 0 ? <div className="admin-empty"><Search size={28} /><h3>No results found</h3><p>Try another search term.</p></div> : rows.map((row) => <article className="admin-row" key={row.id}><div className="row-avatar">{row.title.slice(0, 2).toUpperCase()}</div><div className="row-copy"><strong>{row.title}</strong><span>{row.subtitle}</span></div>{row.tag && <time>{row.tag}</time>}<small>{row.meta}</small><Status value={row.status} /><div className="row-actions"><button title="Edit" onClick={() => update(row.id, row.status === 'Published' || row.status === 'Approved' ? 'Draft' : section === 'pages' || section === 'programme' || section === 'speakers' || section === 'newsletter' ? 'Published' : 'Approved')}><Pencil size={16} /></button><button title="Delete" onClick={() => remove(row.id)}><Trash2 size={16} /></button></div></article>)}</section>;
}

function SettingsPanel({ notify }: { notify: (message: string) => void }) {
  return <div className="settings-grid"><section className="admin-card settings-form"><header><div><span>EVENT INFORMATION</span><h2>Core details</h2></div></header><label>Event name<input defaultValue="AgriTech Fest 2026" /></label><div className="field-pair"><label>Start date<input type="date" defaultValue="2026-11-12" /></label><label>End date<input type="date" defaultValue="2026-11-14" /></label></div><label>Location<input defaultValue="Kano, Nigeria" /></label><label>Contact email<input type="email" defaultValue="info@e360.africa" /></label><button className="admin-primary" onClick={() => notify('Event settings saved')}>Save changes</button></section><section><SiteMaintenanceControl /><article className="admin-card settings-mini"><span>REGISTRATION CAPACITY</span><strong>2,148 <small>/ 3,000</small></strong><div className="progress-track"><i style={{ width: '71.6%' }} /></div><p>852 passes remaining</p></article></section></div>;
}


