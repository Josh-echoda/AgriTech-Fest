import { ArrowUpRight, Mail, Phone } from 'lucide-react';
import './maintenance.css';

export default function MaintenancePage() {
  return <main className="maintenance-page">
    <div className="maintenance-banner">Website temporarily offline for maintenance</div>
    <header className="maintenance-header">
      <img src="/assets/images/LOGO_DARK_.png" alt="AgriTech Fest 2026" />
      <span className="maintenance-status">KANO, NIGERIA · 2026</span>
    </header>
    <section className="maintenance-body" aria-labelledby="maintenance-title">
      <div className="maintenance-copy">

        <h1 id="maintenance-title">Site under<br /><em>maintenance.</em></h1>
        <p className="maintenance-description">We’re updating the AgriTech Fest website.<br />Our pages are temporarily unavailable.</p>
        <p className="maintenance-return">Please check back soon. Thank you for your patience.</p>
        <div className="maintenance-support">
          <h2>Need to reach us?</h2>
          <p>Our team is available for enquiries and sponsorships.</p>
          <div className="maintenance-actions">
            <a className="maintenance-contact" href="mailto:info@e360.africa"><Mail size={18} /> Email the team <ArrowUpRight size={18} /></a>
            <a className="maintenance-phone" href="tel:+2349044660278"><Phone size={16} /> 0904 466 0278</a>
          </div>
        </div>
      </div>
      <aside className="maintenance-event" aria-label="About the event">
        <div className="maintenance-event-label">COMING UP <span>AGRITECH FEST 2026</span></div>
        <figure className="maintenance-art">
          <img src="/assets/images/agritech-coming-soon.png" width="4000" height="5000" fetchPriority="high" alt="Agri-Tech Fest 2026 by e360 Africa. The future of farming is closer than you think. Event artwork featuring a farmer with fresh produce. Enquiries: 09044660278, info@e360.africa." />
        </figure>
        <p className="maintenance-caption">One ecosystem. One experience.</p>
      </aside>
    </section>
    <footer className="maintenance-footer"><span>© 2026 AgriTech Fest · e360 Africa</span><a href="/admin">Admin sign in <ArrowUpRight size={14} /></a></footer>
  </main>;
}
