import { Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import './ticket-pass.css';

export type TicketPassData = {
  id: string;
  name: string;
  email: string;
  type: string;
  day: string;
};

type TicketPassProps = {
  ticket: TicketPassData;
  onBack: () => void;
};

const festivalDays: Record<string, { day: string; date: string; venue: string }> = {
  '2026-11-12': { day: 'Day 1 · Cultivate', date: 'Thursday, Nov 12, 2026', venue: 'Audu Bako College of Agriculture, Dambatta' },
  '2026-11-13': { day: 'Day 2 · Engineer', date: 'Friday, Nov 13, 2026', venue: 'Bayero University Kano, New Site Campus' },
  '2026-11-14': { day: 'Day 3 · Scale', date: 'Saturday, Nov 14, 2026', venue: 'Kano, Nigeria · Venue to be confirmed' },
};

export default function TicketPass({ ticket, onBack }: TicketPassProps) {
  const attendance = festivalDays[ticket.day] ?? { day: 'Selected festival day', date: ticket.day, venue: 'Kano, Nigeria' };
  const qrValue = `AGRITECH-FEST-2026:${ticket.id}`;

  return (
    <section className="ticket-delivery" aria-labelledby="ticket-success-title">
      <div className="ticket-success-copy">
        <p className="ticket-success-kicker"><span aria-hidden="true" /> Registration complete</p>
        <h1 id="ticket-success-title">You&apos;re on the list.</h1>
        <p>Your event pass is ready. Keep it on your phone or save a copy, then show the QR code at the registration desk.</p>

        <div className="ticket-success-actions">
          <button className="ticket-action-primary" type="button" onClick={() => window.print()}>
            <Download size={18} aria-hidden="true" /> Print or save ticket
          </button>
          <button className="ticket-action-secondary" type="button" onClick={onBack}> Back to website
          </button>
        </div>
      </div>

      <article className="event-pass" aria-label={`AgriTech Fest ticket for ${ticket.name}`}>
        <div className="event-pass-notch" aria-hidden="true" />

        <header className="event-pass-header">
          <img src="/assets/images/LOGO_BRIGHT_.png" alt="AgriTech Fest 2026" />
          <div className="event-pass-date">
            <span>Admission date</span>
            <strong>{attendance.date}</strong>
          </div>
        </header>

        <div className="event-pass-details">
          <div className="event-pass-field event-pass-field-wide">
            <span>Event name</span>
            <strong>AgriTech Fest 2026</strong>
          </div>
          <div className="event-pass-field event-pass-field-wide">
            <span>Event venue</span>
            <strong>{attendance.venue}</strong>
          </div>
          <div className="event-pass-field">
            <span>Valid for</span>
            <strong>{attendance.day}</strong>
          </div>
          <div className="event-pass-field">
            <span>Pass type</span>
            <strong>{ticket.type}</strong>
          </div>
        </div>

        <div className="event-pass-attendee">
          <span>Attendee</span>
          <strong>{ticket.name}</strong>
          <small>{ticket.email}</small>
        </div>

        <div className="event-pass-qr" role="img" aria-label={`Check-in QR code for ticket ${ticket.id}`}>
          <QRCodeSVG
            value={qrValue}
            size={236}
            level="H"
            marginSize={1}
            bgColor="#ffffff"
            fgColor="#07131f"
          />
        </div>

        <footer className="event-pass-footer">
          <div><span>Ticket ID</span><code>{ticket.id}</code></div>
          <p><i aria-hidden="true" /> Ready for check-in</p>
        </footer>
      </article>
    </section>
  );
}
