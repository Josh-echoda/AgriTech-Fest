import { useRef, useState, type FormEvent } from 'react';
import { Check } from 'lucide-react';
import { createTicket, premiumPayment } from '../lib/api';
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
    benefits: ['Everything included in Regular', 'Fast-track registration', 'Premium wristband and credential', 'Priority seating', 'VIP/Premium Lounge access', 'Exclusive networking opportunities', 'Premium Meet & Mingle experience', 'Event merchandise pack', 'Premium refreshments', 'Reserved access to selected high-demand sessions', 'Curated founder and investor introductions', 'Exclusive Founders Mixer', 'Premium eCertificate and recognition'],
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
    if (!String(data.get('phone') || '').trim()) { setError('Please enter your phone number.'); return; }
    if (!name) { setError('Please enter your full name.'); return; }
    locked.current = true; setBusy(true); setError('');
    try {
      const input = { full_name: name, email, phone: String(data.get('phone') || '').trim(), ticket_type: pass.name, attendance_date: day, accessibility_notes: String(data.get('notes') || '').trim(), role_designation: String(data.get('role') || ''), looking_forward_to: String(data.get('looking_forward_to') || ''), heard_about: String(data.get('heard_about') || '') };
      if (pass.name === 'Premium pass') {
        const checkout = await premiumPayment({ action: 'initialize', input });
        if (!checkout.authorization_url || !checkout.reference || new URL(checkout.authorization_url).hostname !== 'checkout.paystack.com') throw new Error('Unable to open secure checkout. Please try again.');
        try { sessionStorage.setItem('agritech-payment-reference', checkout.reference); } catch { /* Checkout still works without storage. */ }
        window.location.assign(checkout.authorization_url);
        return;
      }
      const saved = await createTicket(input);
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
    <PendingPayment />
    <fieldset disabled={busy}><legend>Your details</legend>
      <label htmlFor="ticket-name">Full name *</label><input id="ticket-name" name="name" required autoComplete="name" placeholder="Enter your full name" />
      <label htmlFor="ticket-email">Email address *</label><input id="ticket-email" name="email" required type="email" autoComplete="email" aria-describedby="ticket-email-help" placeholder="you@example.com" /><small id="ticket-email-help">Use a personal, student or work email you can access.</small>
      <label htmlFor="ticket-phone">Phone number * <small>(Preferably WhatsApp number)</small></label><input id="ticket-phone" name="phone" required type="tel" autoComplete="tel" placeholder="e.g. 0801 234 5678" />
      <label htmlFor="ticket-role">Role / Designation *</label>
      <select id="ticket-role" name="role" required defaultValue=""><option value="" disabled>Select your role</option>{['Student', 'Farmer', 'Founder / Entrepreneur', 'Agricultural professional', 'Researcher / Educator', 'Investor', 'Government / Development organisation', 'Technology professional', 'Other'].map(value => <option key={value}>{value}</option>)}</select>
    </fieldset>
    <fieldset disabled={busy}><legend>Your experience</legend>
      <label htmlFor="ticket-type">Ticket type *</label>
      <select id="ticket-type" name="type" value={selected} required onChange={event => setSelected(event.target.value)} aria-controls="ticket-benefits"><option value="" disabled>Select your ticket type</option>{passes.map(item => <option key={item.name} value={item.name}>{item.name} — {item.price}</option>)}</select>
      <div id="ticket-benefits" aria-live="polite" aria-atomic="true">{pass && <section className="atf-pass-benefits" aria-label={`${pass.name} benefits`}>
        <div className="atf-pass-heading"><div><span>YOUR SELECTED PASS</span><h3>{pass.name}</h3></div><strong>{pass.price}</strong></div><p>{pass.note}</p><h4>What’s included</h4>
        <ul>{pass.benefits.map(benefit => <li key={benefit}><Check size={17} aria-hidden="true" /><span>{benefit}</span></li>)}</ul>
        <small>{pass.name === 'Premium pass' ? 'Regular gets you into the room. Premium gets you closer to the people you came to meet.' : 'No payment is required for the Regular pass.'}</small>
      </section>}</div>
      <label htmlFor="attendance-day">Attendance day *</label><select id="attendance-day" name="day" defaultValue="" required><option value="" disabled>Select one festival day</option><option value="2026-11-17">Day 1 - Cultivate</option><option value="2026-11-18">Day 2 - Engineer</option><option value="2026-11-19">Day 3 - Scale</option></select>
      <label htmlFor="ticket-interests">What are you looking forward to? *</label>
      <select id="ticket-interests" name="looking_forward_to" required defaultValue=""><option value="" disabled>Select your main interest</option>{['Learning from speakers and panels', 'Networking and meeting collaborators', 'Technology demonstrations and exhibitions', 'AgriTech Battlefield', 'Investment and business opportunities', 'Career and learning opportunities', 'All of the above', 'Other'].map(value => <option key={value}>{value}</option>)}</select>
      <label htmlFor="ticket-source">How did you hear about AgriTech Fest? *</label>
      <select id="ticket-source" name="heard_about" required defaultValue=""><option value="" disabled>Select an option</option>{['Instagram', 'Facebook', 'WhatsApp', 'LinkedIn', 'X / Twitter', 'Friend or colleague', 'School / University', 'Radio', 'Community or partner organisation', 'Search engine', 'Other'].map(value => <option key={value}>{value}</option>)}</select>
      <label htmlFor="ticket-notes">Accessibility or support needs <small>(optional)</small></label><textarea id="ticket-notes" name="notes" rows={3} placeholder="Tell us how we can help you take part comfortably." />
    </fieldset>
    {error && <p className="atf-registration-error" role="alert">{error}</p>}
    <button className="atf-registration-submit" type="submit" disabled={busy || locked.current}>{busy ? 'Please wait…' : selected === 'Premium pass' ? 'Pay securely — ₦50,000' : 'Register for free'}</button>
    <p className="atf-registration-footnote">{selected === 'Premium pass' ? 'Secure payment powered by Paystack. Your pass is issued only after payment is verified.' : 'Your QR pass will appear after registration. Keep it for event-day check-in.'}</p>
  </form>;
}

function PendingPayment() {
  let reference = '';
  try { reference = sessionStorage.getItem('agritech-payment-reference') || ''; } catch { /* Optional recovery hint. */ }
  if (!reference) return null;
  return <p className="atf-registration-footnote">Already attempted payment? <a href={`/tickets?reference=${encodeURIComponent(reference)}`}>Check your previous payment</a> before starting again.</p>;
}
