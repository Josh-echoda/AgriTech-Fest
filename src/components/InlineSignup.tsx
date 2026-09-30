import { useId, useState } from 'react';
import { subscribeToNewsletter } from '../lib/api';

export default function InlineSignup({ label = 'Be first to know' }: { label?: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const id = useId();
  if (done) return <p role="status">You're on the list. Watch your inbox for updates.</p>;
  return <div className="inline-signup">
    <button className="button button-lime" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>{label}</button>
    {open && <form id={id} onSubmit={async event => {
      event.preventDefault();
      if (busy) return;
      const email = String(new FormData(event.currentTarget).get('email') || '').trim();
      setBusy(true); setError('');
      try { await subscribeToNewsletter({ email }); setDone(true); }
      catch { setError('Unable to subscribe. Please try again.'); }
      finally { setBusy(false); }
    }}>
      <label htmlFor={id + '-email'}>Email address</label>
      <input autoFocus id={id + '-email'} name="email" type="email" autoComplete="email" placeholder="you@example.com" required disabled={busy} />
      <button type="submit" disabled={busy}>{busy ? 'Joining...' : 'Notify me'}</button>
      {error && <p role="alert">{error}</p>}
    </form>}
  </div>;
}
