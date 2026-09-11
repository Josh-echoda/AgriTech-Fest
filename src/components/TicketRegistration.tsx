import { useRef, useState, type FormEvent } from 'react';
import { Check } from 'lucide-react';
import { createTicket } from '../lib/api';
import './ticket-registration.css';
const passes = [
  {
    name: 'Regular pass',
    price: 'Free',
    note: 'Experience the Fest. For students, farmers, innovators, professionals and everyone who wants to experience AgriTech Fest.',
    benefits: ['3-day AgriTech Fest access', 'Main stage sessions', 'Keynotes and panel discussions', 'Exhibition access', 'Technology demonstrations', 'AgriTech Battlefield', 'General networking areas', 'Meet & Mingle access', 'Digital programme', 'Event credential', 'eCertificate of Attendance'],
  },
  {
    name: 'Premium pass',
    price: '₦50,000',
    note: 'Experience the Fest differently. Get closer to the people, conversations and opportunities shaping African agriculture.',
    benefits: ['Everything included in Regular', 'Fast-track registration', 'Premium wristband and credential', 'Priority seating', 'VIP/Premium Lounge access', 'Exclusive networking opportunities', 'Premium Meet & Mingle experience', 'Event merchandise pack', 'Premium refreshments', 'Reserved access to selected high-demand sessions', 'Curated founder and investor introductions', 'Exclusive Founders Mixer — Sunday, 15 November', 'Premium eCertificate and recognition'],
  },
];
export default function TicketRegistration({ onComplete }: { onComplete: () => void }) {
  const [selected, setSelected] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const locked = useRef(false);
  const pass = passes.find(item => item.name === selected);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked.current || !pass) return;
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const day = String(data.get('day') || '');
    if (!name) { setError('Please enter your full name.'); return; }
    locked.current = true; setBusy(true); setError('');
    try {
      const saved = await createTicket({ full_name: name, email, phone: String(data.get('phone') || '').trim(), ticket_type: pass.name, attendance_date: day, accessibility_notes: String(data.get('notes') || '').trim() });
      try { localStorage.setItem('agritech-ticket', JSON.stringify({ id: saved.ticket_code, name, email, type: pass.name, day })); }
      catch { setError(`Registration saved. Keep your reference ${saved.ticket_code} and contact info@e360.africa for your pass. Please do not register again.`); return; }
      onComplete();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Registration could not be completed. Please try again.');
      locked.current = false;
    } finally { setBusy(false); }
  }
  return <form className="atf-registration" id="purchase" onSubmit={submit}>
    <header><span>BE PART OF AGRITECH FEST 2026</span><h2>Your next connection starts here.</h2><p>Students, farmers, founders, professionals and curious minds — everyone has a place. Fields marked * are required.</p></header>
    <fieldset disabled={busy}><legend>Your details</legend>
      <label htmlFor="ticket-name">Full name *</label><input id="ticket-name" name="name" required autoComplete="name" placeholder="Enter your full name" />
      <label htmlFor="ticket-email">Email address *</label><input id="ticket-email" name="email" required type="email" autoComplete="email" aria-describedby="ticket-email-help" placeholder="you@example.com" /><small id="ticket-email-help">Use a personal, student or work email you can access.</small>
      <label htmlFor="ticket-phone">Phone number <small>(optional)</small></label><input id="ticket-phone" name="phone" type="tel" autoComplete="tel" placeholder="e.g. 0801 234 5678" />
    </fieldset>
    <fieldset disabled={busy}><legend>Your experience</legend>
      <label htmlFor="ticket-type">Ticket type *</label>
      <select id="ticket-type" name="type" value={selected} required onChange={event => setSelected(event.target.value)} aria-controls="ticket-benefits"><option value="" disabled>Select your ticket type</option>{passes.map(item => <option key={item.name} value={item.name}>{item.name} — {item.price}</option>)}</select>
      <div id="ticket-benefits" aria-live="polite" aria-atomic="true">{pass && <section className="atf-pass-benefits" aria-label={`${pass.name} benefits`}>
        <div className="atf-pass-heading"><div><span>YOUR SELECTED PASS</span><h3>{pass.name}</h3></div><strong>{pass.price}</strong></div><p>{pass.note}</p><h4>What’s included</h4>
        <ul>{pass.benefits.map(benefit => <li key={benefit}><Check size={17} aria-hidden="true" /><span>{benefit}</span></li>)}</ul>
        <small>{pass.name === 'Premium pass' ? 'Regular gets you into the room. Premium gets you closer to the people you came to meet.' : 'No payment is required for the Regular pass.'}</small>
      </section>}</div>
      <label htmlFor="attendance-day">Attendance day *</label><select id="attendance-day" name="day" defaultValue="" required><option value="" disabled>Select one festival day</option><option value="2026-11-12">Day 1 · Cultivate — 12 November 2026</option><option value="2026-11-13">Day 2 · Engineer — 13 November 2026</option><option value="2026-11-14">Day 3 · Scale — 14 November 2026</option></select>
      <label htmlFor="ticket-notes">Accessibility or support needs <small>(optional)</small></label><textarea id="ticket-notes" name="notes" rows={3} placeholder="Tell us how we can help you take part comfortably." />
    </fieldset>
    {error && <p className="atf-registration-error" role="alert">{error}</p>}
    <button className="atf-registration-submit" type="submit" disabled={busy || locked.current}>{busy ? 'Creating your pass…' : 'Register for AgriTech Fest'}</button>
    <p className="atf-registration-footnote">Your QR pass will appear after registration. Keep it for event-day check-in.</p>
  </form>;
}
