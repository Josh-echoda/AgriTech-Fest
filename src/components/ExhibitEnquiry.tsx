import { useState } from 'react';
import { createEnquiry } from '../lib/api';

export default function ExhibitEnquiry({ enterprise = false }: { enterprise?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  return <section id="exhibit-enquiry" className="exhibit-enquiry">
    <h2>{enterprise ? 'Enterprise enquiry' : 'Register your interest in exhibiting.'}</h2>
    <p>{enterprise ? 'Tell us about your organisation and how you would like to participate.' : 'Tell us about your organisation and what you would like to showcase. Our team will contact you about exhibiting.'}</p>
    {sent ? <p role="status">Thank you. Your enquiry has been received.</p> :
    <form onSubmit={async event => {
      event.preventDefault();
      if (busy) return;
      const data = new FormData(event.currentTarget);
      setBusy(true); setError('');
      try {
        await createEnquiry({ enquiry_type: enterprise ? 'contact' : 'exhibitor', subject: enterprise ? 'Enterprise enquiry' : 'Exhibition enquiry', name: String(data.get('name')), email: String(data.get('email')), organisation: String(data.get('organisation')), phone: String(data.get('phone') || ''), message: String(data.get('message')) });
        setSent(true);
      } catch { setError('We could not send your enquiry. Please try again.'); }
      finally { setBusy(false); }
    }}>
      <fieldset disabled={busy}>
        <label>Your name *<input name="name" autoComplete="name" required /></label>
        <label>Email address *<input name="email" type="email" autoComplete="email" required /></label>
        <label>Organisation *<input name="organisation" autoComplete="organization" required /></label>
        <label>Phone number<input name="phone" type="tel" autoComplete="tel" /></label>
        <label>{enterprise ? 'How would you like to participate? *' : 'What would you like to exhibit? *'}<textarea name="message" rows={4} required /></label>
        <button className="button button-dark" type="submit">{busy ? 'Sending...' : enterprise ? 'Submit enterprise enquiry' : 'Submit exhibition enquiry'}</button>
      </fieldset>
      {error && <p role="alert">{error}</p>}
    </form>}
  </section>;
}
