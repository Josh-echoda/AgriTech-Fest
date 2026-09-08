import { ArrowUpRight, Sprout } from 'lucide-react';
import './maintenance.css';

export default function MaintenancePage() {
  return <main className="maintenance-page">
    <header className="maintenance-header">
      <img src="/assets/images/LOGO_BRIGHT_.png" alt="AgriTech Fest 2026" />
      <span className="maintenance-status"><i /> A LITTLE WORK. A BIGGER HARVEST.</span>
    </header>
    <section className="maintenance-body">
      <div className="maintenance-copy">
        <p className="maintenance-eyebrow">AGRICULTURE. TECHNOLOGY. POSSIBILITY.</p>
        <h1>Something<br />good is <em>growing.</em></h1>
        <p className="maintenance-description">We’re giving our website a little room to grow. AgriTech Fest will be back online soon, ready to connect the people shaping the future of food.</p>
        <div className="maintenance-note"><span /> WEBSITE UNDER MAINTENANCE</div>
        <a className="maintenance-contact" href="mailto:info@e360.africa">Get in touch <ArrowUpRight size={20} /></a>
      </div>
      <div className="maintenance-art" aria-hidden="true">
        <div className="maintenance-orbit orbit-one" /><div className="maintenance-orbit orbit-two" />
        <span className="maintenance-art-label">THE NEXT SEASON STARTS HERE</span>
        <div className="maintenance-seed"><Sprout strokeWidth={1.1} /></div>
        <div className="maintenance-soil"><span /><span /><span /><span /></div>
        <span className="maintenance-art-footer">ROOTED IN AGRICULTURE. BUILT FOR TOMORROW.</span>
      </div>
    </section>
    <footer className="maintenance-footer"><span>AgriTech Fest 2026 <b>·</b> Kano, Nigeria</span><span>Cultivate. Engineer. Scale.</span><a href="/admin">Admin sign in <ArrowUpRight size={14} /></a></footer>
  </main>;
}
