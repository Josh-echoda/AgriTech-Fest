import { useEffect, useRef, useState } from 'react';
import { premiumPayment } from '../lib/api';
import TicketPass, { type TicketPassData } from './TicketPass';
export default function PaymentReturn() {
  const [ticket, setTicket] = useState<TicketPassData | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const started = useRef(false);
  const reference = new URLSearchParams(window.location.search).get('reference') || new URLSearchParams(window.location.search).get('trxref') || '';
  async function verify() {
    setBusy(true); setError('');
    try {
      const result = await premiumPayment({ action: 'verify', reference });
      if (!result.ticket) throw new Error('Your pass could not be loaded. Please retry verification.');
      const pass = { ...result.ticket, test: result.test === true };
      setTicket(pass);
      // Storage is optional: a confirmed pass remains visible if browser storage is blocked.
      try { localStorage.setItem('agritech-ticket', JSON.stringify(pass)); sessionStorage.removeItem('agritech-payment-reference'); } catch { /* Keep the pass on screen. */ }
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Unable to verify payment. Retry without paying again.'); }
    finally { setBusy(false); }
  }
  useEffect(() => {
    if (!started.current) { started.current = true; void verify(); }
    // Verify once on return. Subsequent retries are explicitly requested by the attendee.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (ticket) return <TicketPass ticket={ticket} onBack={() => window.location.assign('/')} />;
  return <section className="atf-registration" aria-live="polite"><h2>{busy ? 'Verifying your payment…' : 'Payment verification'}</h2><p>Your payment is processed securely by Paystack. Your pass will appear after verification.</p>{error && <p role="alert">{error}</p>}<button className="atf-registration-submit" disabled={busy} onClick={() => void verify()}>Retry verification</button><p>Do not pay again if your transaction succeeded. Contact info@e360.africa with reference <code>{reference}</code> if you need help.</p><a href="/tickets">Return to registration</a></section>;
}
