import { ArrowUpRight, Mail, Phone } from 'lucide-react';
import './maintenance.css';

export default function MaintenancePage() {
  return <main className="maintenance-page">
    <header className="maintenance-header">
      <img src="/assets/images/LOGO_DARK_.png" alt="AgriTech Fest 2026" />
      <span className="maintenance-status"><i /> THE NEXT SEASON IS COMING</span>
    </header>
    <section className="maintenance-body">
      <div className="maintenance-copy">
        <p className="maintenance-eyebrow">ONE ECOSYSTEM. ONE EXPERIENCE.</p>
        <h1>A fresh season.<br /><em>A shared future.</em></h1>
        <p className="maintenance-description">The future of farming is closer than you think. We’re getting our website ready for AgriTech Fest 2026 — bringing people, ideas and innovation together in Kano.</p>
        <div className="maintenance-note"><span /> WEBSITE UNDER MAINTENANCE</div>
        <p className="maintenance-return">We’ll be back online soon. For enquiries and sponsorships, let’s talk.</p>
        <div className="maintenance-actions">
          <a className="maintenance-contact" href="mailto:info@e360.africa"><Mail size={18} /> Get in touch <ArrowUpRight size={19} /></a>
          <a className="maintenance-phone" href="tel:+2349044660278"><Phone size={16} /> 0904 466 0278</a>
        </div>
        <div className="maintenance-signature"><span /> Where the future of food begins.</div>
      </div>
      <figure className="maintenance-art">
        <img src="/assets/images/agritech-coming-soon.png" width="4000" height="5000" fetchPriority="high" alt="Agri-Tech Fest 2026 by e360 Africa. Coming soon: The future of farming is closer than you think. A smiling farmer holds a basket of fresh vegetables. One ecosystem. One experience. Enquiries and sponsorships: 09044660278, info@e360.africa." />
      </figure>
    </section>
    <footer className="maintenance-footer"><span>AgriTech Fest 2026 <b>·</b> Kano, Nigeria</span><span>Cultivate. Engineer. Scale.</span><a href="/admin">Admin sign in <ArrowUpRight size={14} /></a></footer>
  </main>;
}
