import { useEffect, useRef, useState } from 'react';
import { createTicketPdf } from '../lib/ticketPdf';
import { Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import './ticket-pass.css';

export type TicketPassData = {
  id: string;
  name: string;
  email: string;
  type: string;
  day: string;
  test?: boolean;
};

type TicketPassProps = {
  ticket: TicketPassData;
  onBack: () => void;
};

const festivalDays: Record<string, { day: string; date: string; venue: string }> = {
  '2026-11-17': { day: 'Day 1 · Cultivate', date: 'Tuesday, Nov 17, 2026', venue: 'Audu Bako College of Agriculture, Dambatta' },
  '2026-11-18': { day: 'Day 2 · Engineer', date: 'Wednesday, Nov 18, 2026', venue: 'Bayero University Kano, New Site Campus' },
  '2026-11-19': { day: 'Day 3 · Scale', date: 'Thursday, Nov 19, 2026', venue: 'Meena Event Center' },
};

export default function TicketPass({ ticket, onBack }: TicketPassProps) {
  const passElement = useRef<HTMLElement>(null);
  const [saving, setSaving] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [saveError, setSaveError] = useState('');
  useEffect(() => () => { if (downloadUrl) URL.revokeObjectURL(downloadUrl); }, [downloadUrl]);
  async function savePass() {
    if (saving) return;
    setSaving(true); setSaveError('');
    try {
      const qr = passElement.current?.querySelector('svg');
      if (!qr) throw new Error('Your QR code is still loading. Please retry.');
      const blob = await createTicketPdf(ticket, attendance, qr);
      const url = URL.createObjectURL(blob); setDownloadUrl(url);
      const link = document.createElement('a'); link.href = url; link.download = `${ticket.id}.pdf`;
      document.body.appendChild(link); link.click(); link.remove();
    } catch (error) { setSaveError(error instanceof Error ? error.message : 'Could not save the pass. Please retry.'); }
    finally { setSaving(false); }
  }
  const legacyDays: Record<string, string> = { '2026-11-12': '2026-11-17', '2026-11-13': '2026-11-18', '2026-11-14': '2026-11-19' };
  const attendance = festivalDays[legacyDays[ticket.day] || ticket.day] ?? { day: 'Selected festival day', date: ticket.day, venue: 'Kano, Nigeria' };
  const qrValue = `AGRITECH-FEST-2026:${ticket.id}`;

  return (
    <section className="ticket-delivery" aria-labelledby="ticket-success-title">
      <div className="ticket-success-copy">
        <div className="ticket-confirmed-mark" aria-hidden="true">✓</div>
        <h1 id="ticket-success-title">{ticket.test ? 'Test payment successful.' : 'Your pass is ready.'}</h1>
        <p>{ticket.test ? 'Checkout completed. This test pass is not valid for event admission.' : 'Save your pass and bring it along. We’ll see you at AgriTech Fest.'}</p>
      </div>
      <article ref={passElement} className="event-pass" aria-label={`AgriTech Fest ticket for ${ticket.name}`}>
        <header className="event-pass-header">
          <img src="/assets/images/LOGO_BRIGHT_.png" alt="AgriTech Fest" />
          <div><strong>AgriTech Fest 2026</strong><span>Kano, Nigeria</span></div>
          <span className="event-pass-badge">{ticket.test ? 'TEST PASS' : ticket.type}</span>
        </header>
        <div className="event-pass-body">
          <div className="event-pass-information">
            <div className="event-pass-attendee"><span>Attendee</span><strong>{ticket.name}</strong><small>{ticket.email}</small></div>
            <div className="event-pass-details">
              <div className="event-pass-field"><span>Pass type</span><strong>{ticket.type}</strong></div>
              <div className="event-pass-field"><span>Attendance</span><strong>{attendance.day}</strong></div>
              <div className="event-pass-field event-pass-field-wide"><span>Venue</span><strong>{attendance.venue}</strong></div>
            </div>
          </div>
          <div className="event-pass-scan">
            <div className="event-pass-qr" role="img" aria-label={`QR code for ticket ${ticket.id}`}><QRCodeSVG value={qrValue} size={156} level="M" marginSize={4} bgColor="#ffffff" fgColor="#07131f" /></div>
            <span>{ticket.test ? 'Test QR · No admission' : 'Scan at check-in'}</span>
          </div>
        </div>
        <footer className="event-pass-footer"><code>{ticket.id}</code><span>{ticket.test ? 'TEST ONLY · NOT VALID FOR ADMISSION' : 'One attendee · Keep your pass safe'}</span></footer>
      </article>
      <div className="ticket-success-actions">
        <button className="ticket-action-primary" type="button" onClick={() => void savePass()} disabled={saving}><Download size={16} aria-hidden="true" /> {saving ? 'Preparing PDF…' : 'Download PDF pass'}</button>
        <button className="ticket-action-secondary" type="button" onClick={onBack}>Back to website</button>
      </div>
      {saveError && <p className="ticket-help" role="alert">{saveError}</p>}
      {downloadUrl && <p className="ticket-help" role="status">PDF ready. <a href={downloadUrl} download={`${ticket.id}.pdf`}>Download again</a> or <a href={downloadUrl} target="_blank" rel="noreferrer">open PDF to print</a>.</p>}
      <p className="ticket-help">Need a hand? <a href="mailto:info@e360.africa">Contact the event team</a></p>
    </section>
  );
}
