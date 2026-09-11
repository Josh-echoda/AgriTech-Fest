import { useEffect, useRef, useState, type ReactNode } from 'react';
import Admin from './Admin';
import './components/home-mixer.css';
import './components/hero-refinement.css';
import './components/public-heading-cleanup.css';
import './components/supporter-logos.css';
import './components/speaker-reveal.css';
import './components/newsletter-page.css';
import MaintenancePage from './components/MaintenancePage';
import { useSiteLive } from './lib/useSiteLive';
import SiteNav from './components/SiteNav';
import TicketPass from './components/TicketPass';
import TicketRegistration from './components/TicketRegistration';
import BattlefieldApplication from './components/BattlefieldApplication';
import EventCountdown from './components/EventCountdown';
import { createEnquiry, subscribeToNewsletter } from './lib/api';
import {
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  CircleArrowUp,
  Sparkles,
  Sprout,
  Trophy,
} from 'lucide-react';

const heroImages = [
  'https://images.pexels.com/photos/34182315/pexels-photo-34182315.jpeg?auto=compress&cs=tinysrgb&w=1920',
  'https://images.pexels.com/photos/11588042/pexels-photo-11588042.jpeg?auto=compress&cs=tinysrgb&w=1920',
  'https://images.pexels.com/photos/34525840/pexels-photo-34525840.jpeg?auto=compress&cs=tinysrgb&w=1920',
  'https://images.pexels.com/photos/29571175/pexels-photo-29571175.jpeg?auto=compress&cs=tinysrgb&w=1920',
];
const farmerImage = 'https://images.pexels.com/photos/34182310/pexels-photo-34182310.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

const supporterLogos = [
  { name: 'e360 Technologies Ltd', src: '/assets/partners/e360.png' },
  { name: 'FaWCOS', src: '/assets/partners/fawcos.png' },
  { name: 'Kano State Government', src: '/assets/partners/kano-state.png' },
  { name: 'Kano State Ministry of Agriculture', src: '/assets/partners/ministry-of-agriculture.png' },
  { name: 'Cool FM Kano', src: '/assets/partners/cool-fm-kano.png' },
  { name: 'Arewa Radio 93.1', src: '/assets/partners/arewa-fm.png' },
  { name: 'Wazobia FM 95.1 Kano', src: '/assets/partners/wazobia-fm.png' },
];

function PartnerMarquee() {
  return <div className="supporter-marquee" aria-label="AgriTech Fest supporters">
    <div className="supporter-track">
      {[0, 1].map(copy => <ul className="supporter-logos" key={copy} aria-hidden={copy === 1 ? true : undefined}>
        {supporterLogos.map(logo => <li key={logo.src} tabIndex={copy === 0 ? 0 : -1} aria-label={copy === 0 ? logo.name : undefined}>
          <img src={logo.src} alt={copy === 0 ? logo.name : ''} title={logo.name} loading="lazy" decoding="async" />
        </li>)}
      </ul>)}
    </div>
  </div>;
}
const promiseItems = [
  ['MEET', 'The people moving agriculture forward', 'Founders, investors, farmers, researchers, policymakers and operators shaping Africa’s agricultural economy.'],
  ['DISCOVER', 'Technology you can actually see', 'Drones. Precision agriculture. Smart machinery. Data platforms. Processing. Inputs.'],
  ['LEARN', 'From people doing the work', 'Real conversations about technology, financing, food systems, education, mechanisation and scale.'],
  ['BUILD', 'Relationships beyond the conference', 'Meet future partners, customers, investors, collaborators and the talent to build what comes next.'],
  ['EXPERIENCE', 'Agriculture beyond PowerPoint', 'Live demonstrations, exhibitions, technology showcases and practical engagement.'],
  ['CELEBRATE', 'Africa’s next generation', 'Watch emerging founders compete through AgriTech Battlefield.'],
];
const days = [
  { number: '01', title: 'CULTIVATE', label: 'Youth · Innovation · Education', place: 'Audu Bako College of Agriculture, Dambatta University Campus', text: 'Innovation & Education Day for student engagement, career pathways and Agri-tech showcase.', color: 'lime' },
  { number: '02', title: 'ENGINEER', label: 'Farmers · Research · Technology', place: 'Bayero University Kano, BUK New Site Campus', text: 'Collaboration & Farmer Engagement Day focused on farmer inclusion, inter-university exchange and agri-business.', color: 'gold' },
  { number: '03', title: 'SCALE', label: 'Policy · Investment · Partnership', place: 'Coronation Hall, Government House or Meena Events', text: 'Policy, pitch & partnership day for dialogue, investment and major announcements.', color: 'navy' },
];
const programmeDays = [
  {
    tab: 'Day 01 · Cultivate',
    intro: 'Venue: University Theatre (500–600 capacity). Focus: Student Engagement, Career Pathways, Agri-tech Showcase.',
    sessions: [
      ['7:00 AM', 'Pre-event farm visit', 'Morning visit to a local farmers\' settlement for documentary filming and farmer interviews.'],
      ['9:00 AM', 'Opening', 'Registration, welcome by SUG President, opening remarks by Provost/Dean of Students.'],
      ['10:30 AM', 'Keynote', "Keynote Address: 'The Future of Farming in Africa' by an international expert."],
      ['11:00 AM', 'Career panel', 'From Campus to Farm: what must Nigeria\'s universities teach to produce agri-entrepreneurs, not just graduates?'],
      ['11:40 AM', 'Exhibition', 'Precision Agriculture Exhibition with live drone demonstrations and displays.'],
      ['12:40 PM', 'Lunch break', 'Networking lunch for all participants and exhibitors.'],
      ['1:15 PM', 'Engagement panel', 'We Grow What We Eat: scaling affordable agri-tech machinery for smallholder farmers in Northern Nigeria.'],
      ['1:55 PM', 'Training', 'Workshop sessions on greenhouse management and precision agriculture with practical demonstrations.'],
      ['2:40 PM', 'Fun activity', 'Agri-Quiz Challenge and student team pitch-off with small prizes.'],
      ['3:00 PM', 'Close Day 1', 'Closing remarks and announcements for Day 2.'],
    ],
  },
  {
    tab: 'Day 02 · Engineer',
    intro: 'Venue: BUK New Site Campus. Focus: Farmer Inclusion, Inter-University Exchange, Agri-Business.',
    sessions: [
      ['7:00 AM', 'Pre-event farm visit', 'Morning visit to a local farmers\' settlement for documentary filming and farmer interviews.'],
      ['9:30 AM', 'Opening', 'Welcome address and introductions from partner university leadership.'],
      ['10:00 AM', 'Farmer forum', 'Farmers share experiences while extension workers and farmer groups present challenges and innovations.'],
      ['11:00 AM', 'AgBusiness panel', 'Cracking the N3.5 Trillion Drain: deploying cold-chain, processing and smart logistics to eliminate post-harvest waste in Northern Nigeria.'],
      ['1:00 PM', 'Lunch break', 'Networking lunch where farmers, students and companies mingle.'],
      ['1:30 PM', 'Remote farming panel', 'Smart Farming in Fragile Zones: drones, GIS and remote sensing to protect farmers and predict yields.'],
      ['2:00 PM', 'Training', 'Hands-on sessions on drone operation, GPS farm mapping and carbon tracking basics.'],
      ['3:30 PM', 'Speakers', 'Call for Speakers session with open contributions from delegates and extension associations.'],
      ['4:15 PM', 'Fun activity', 'Farmers vs Students quiz bowl and networking games to spark collaboration.'],
      ['5:00 PM', 'Close Day 2', 'Cultural showcase, entertainment, recap and preview of Government House Day.'],
    ],
  },
  {
    tab: 'Day 03 · Scale',
    intro: 'Venue: Government House or Meena Events. Focus: Policy Dialogue, Grand Pitch Competition, Sponsorship Announcements.',
    sessions: [
      ['9:00 AM', 'Opening ceremony', 'Red carpet arrival, national anthem and dignitaries\' welcome with commissioners, FAO and major companies.'],
      ['9:45 AM', 'Keynote', 'Government\'s Agricultural Development Agenda for Northern Nigeria.'],
      ['10:30 AM', 'Policy panel', 'Northern Nigeria\'s Agricultural Renaissance: policy, investment and the road to food sovereignty.'],
      ['11:05 AM', 'GIS panel', 'Smart Farming in Fragile Zones: drones, GIS and remote sensing to protect farmers and predict yields.'],
      ['11:30 AM', 'Investment panel', 'Who Funds the Future? Agri-finance, impact investment and the business case for Northern Nigerian agriculture.'],
      ['12:00 PM', 'Exhibition', 'Exhibition hall open for agri-tech companies and student project displays.'],
      ['1:00 PM', 'Meat & meet', 'High-level networking lunch for government officials, sponsors and partners.'],
      ['2:00 PM', 'Pitch competition', 'Grand finale: five student innovator finalists present to commissioners, investors and agri-experts, followed by the FAWCOS launch.'],
      ['3:30 PM', 'Awards', 'Winner announcement, prize presentation and sponsor recognition ceremony.'],
      ['4:30 PM', 'Closing', 'Closing keynote, MoU signings, group photos and media interviews.'],
      ['5:00 PM', 'Fun activity', 'Deal-room speed networking and a victory photo wall for finalists and partners.'],
    ],
  },
];

function Mark({ light = false }: { light?: boolean }) {
  return <img className={`brand-logo ${light ? 'brand-logo-light' : ''}`} src={light ? '/assets/images/LOGO_BRIGHT_.png' : '/assets/images/LOGO_DARK_.png'} alt="Agri-Tech Fest 2026" />;
}

const routeMap: Record<string, string> = {
  home: '/',
  about: '/about',
  programme: '/programme',
  speakers: '/speakers',
  'agritech-battlefield': '/battlefield',
  battlefield: '/battlefield',
  exhibit: '/exhibit',
  partners: '/sponsors-partners',
  'get-involved': '/get-involved',
  sponsors: '/sponsors-partners',
  sponsor: '/sponsor',
  tickets: '/tickets',
  promise: '/about',
  faq: '/faq',
  newsletter: '/newsletter',
  contact: '/contact',
  privacy: '/privacy',
  terms: '/terms',
};

function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function SiteHeader({ navigateTo }: { navigateTo: (path: string) => void }) {
  return <SiteNav onNavigate={navigateTo} logo={<Mark />} />;
}

function SiteFooter({ navigateTo }: { navigateTo: (path: string) => void }) {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand"><Mark light /><p>Where the future<br />Food begins.</p><span>© 2026 e360 Africa — Efficience 360 Technologies Ltd.</span></div>
        <div className="footer-col"><b>Explore</b><button onClick={() => navigateTo('/about')}>About</button><button onClick={() => navigateTo('/programme')}>Programme</button><button onClick={() => navigateTo('/speakers')}>Speakers</button><button onClick={() => navigateTo('/battlefield')}>Battlefield</button></div>
        <div className="footer-col"><b>Get involved</b><button onClick={() => navigateTo('/tickets')}>Tickets</button><button onClick={() => navigateTo('/sponsor')}>Sponsor</button><button onClick={() => navigateTo('/exhibit')}>Exhibit</button><button onClick={() => navigateTo('/media')}>Media pass</button></div>
        <div className="footer-col"><b>Connect</b><button onClick={() => navigateTo('/newsletter')}>Newsletter</button><button onClick={() => navigateTo('/contact')}>Contact</button><a href="https://www.instagram.com/agritechfest_/" target="_blank" rel="noreferrer">Instagram: @Agritechfest_</a><a href="https://www.facebook.com/Agritechfest" target="_blank" rel="noreferrer">Facebook: Agritechfest</a></div>
      </div>
      <div className="container footer-bottom"><span><button onClick={() => navigateTo('/privacy')}>Privacy</button> · <button onClick={() => navigateTo('/terms')}>Terms</button></span><span>Made for the people building tomorrow.</span><button onClick={() => navigateTo('/')}>Back to top</button></div>
    </footer>
  );
}

function PageShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const navigateTo = (path: string) => navigate(path);

  return (
    <div className="site-shell">
      <SiteHeader navigateTo={navigateTo} />
      <main className="container page-shell-main">
        <section className="section page-shell-heading">
          <p className="eyebrow"><span /> {subtitle}</p>
          <h1 style={{ marginTop: 18, fontFamily: 'var(--font-display)', fontSize: 'clamp(42px, 6.5vw, 70px)', lineHeight: 0.94, letterSpacing: '-0.05em', marginBottom: 18 }}>{title}</h1>
        </section>
        {children}
      </main>
      <SiteFooter navigateTo={navigateTo} />
    </div>
  );
}

function CountUpStat({ value, suffix = '', label }: { value: number; suffix?: string; label: string }) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) { setDisplayValue(value); return; }

    let animationFrame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const startedAt = performance.now();
      const animate = (now: number) => {
        const progress = Math.min((now - startedAt) / 1400, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.round(value * eased));
        if (progress < 1) animationFrame = requestAnimationFrame(animate);
      };
      animationFrame = requestAnimationFrame(animate);
    }, { threshold: 0.35 });
    observer.observe(element);
    return () => { observer.disconnect(); cancelAnimationFrame(animationFrame); };
  }, [value]);

  return <div className="number-item" ref={elementRef}><strong>{displayValue.toLocaleString()}{suffix}</strong><span>{label}</span></div>;
}
function HomePage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [heroSlide, setHeroSlide] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;
    const timer = window.setInterval(() => setHeroSlide(index => (index + 1) % heroImages.length), 6000);
    return () => window.clearInterval(timer);
  }, []);

  const scrollTo = (id: string) => {
    if (routeMap[id]) {
      navigate(routeMap[id]);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="site-shell home-site-shell">
      <SiteNav onNavigate={(path) => navigate(path)} logo={<Mark />} />

      <main id="top">
        <section className="hero">
          <div className="hero-slides" aria-hidden="true">
            {heroImages.map((image, index) => <div className={`hero-image ${heroSlide === index ? 'is-active' : ''}`} style={{ backgroundImage: `url(${image})` }} key={image} />)}
          </div>
          <div className="hero-overlay" />
          <div className="hero-grid" />
          <div className="hero-year" aria-hidden="true">2026</div>
          <div className="container hero-content">
            <div className="hero-copy"><h1>Where the future of Food <em>Begins.</em></h1><p className="hero-description">The conference bringing Africa’s agritech ecosystem together to connect, collaborate, exchange ideas and celebrate the technologies and people transforming agriculture across the continent.</p><div className="hero-buttons"><button className="button button-lime" onClick={() => scrollTo('tickets')}>Secure your spot</button><button className="button button-outline" onClick={() => scrollTo('sponsor')}>Become a sponsor</button></div><div className="hero-countdown-wrap"><EventCountdown /></div></div>

            <div className="hero-slide-dots" aria-label="Choose hero image">
              {heroImages.map((_, index) => <button type="button" className={heroSlide === index ? 'is-active' : ''} onClick={() => setHeroSlide(index)} aria-label={`Show hero image ${index + 1}`} aria-current={heroSlide === index ? 'true' : undefined} key={index} />)}
            </div>
            <div className="hero-footer"><span>3 days</span><i /> <span>3 experiences</span><i /> <span>one agricultural future</span><div className="hero-scroll"><CircleArrowUp size={18} /> scroll to explore</div></div>
          </div>
        </section>

        <section className="partner-strip"><div className="container partner-inner"><div className="supported"><span>Supported by</span><PartnerMarquee /></div></div></section>

        <section className="numbers container" aria-label="Event at a glance"><div className="numbers-grid"><CountUpStat value={3} label="days" /><CountUpStat value={3} label="venues" /><CountUpStat value={2000} label="participants" /><CountUpStat value={10} suffix="+" label="speakers" /><CountUpStat value={20} suffix="+" label="exhibitors" /><CountUpStat value={5} label="battlefield finalists" /></div></section>

        <section className="about section container" id="about"><div className="section-kicker"><span>the big idea</span></div><div className="about-grid"><div><h2>Agriculture is changing.<br /><em>Africa is building<br />what comes next.</em></h2></div><div className="about-copy"><p>AgriTech Fest connects the people growing our food with the innovators transforming how it is produced, financed, processed, distributed and consumed.</p><p>For three days, farmers, founders, students, researchers, investors, policymakers, development organisations and technology companies come together to explore practical solutions capable of moving African agriculture forward.</p><button className="arrow-link" onClick={() => navigate('/about')}>Discover AgriTech Fest</button></div></div></section>

        <section className="promise section" id="promise"><div className="container"><div className="promise-heading"><div><p className="eyebrow"><span /> The promise</p><h2>Come for the ideas.<br /><em>Leave with momentum.</em></h2></div><p>One place to meet the people, technologies and opportunities moving African agriculture forward.</p></div><div className="promise-grid">{promiseItems.map(([title, subtitle, text], i) => <article className="promise-card" key={title}><span className="card-number">0{i + 1}</span><span className="promise-title">{title}</span><h3>{subtitle}</h3><p>{text}</p><ArrowUpRight className="card-arrow" size={20} /></article>)}</div></div></section>

        <section className="days section container" id="programme"><div className="section-heading-row"><div><p className="eyebrow"><span /> Three days. Three experiences.</p><h2>A festival with a <em>point of view.</em></h2></div><button className="arrow-link desktop-only" onClick={() => navigate('/programme')}>Explore full programme</button></div><div className="days-grid">{days.map((item, i) => <article className={`day-card day-${item.color}`} key={item.number}><div className="day-top"><span>Day {item.number}</span><Sprout size={21} /></div><h3>{item.title}</h3><strong>{item.label}</strong><p>{item.text}</p><button className="day-link" onClick={() => navigate('/programme')}>View day {i + 1}</button></article>)}</div></section>

        <section className="battlefield" id="battlefield"><div className="battlefield-shape shape-one" /><div className="battlefield-shape shape-two" /><div className="container battlefield-inner"><div className="battlefield-top"><p className="eyebrow light-eyebrow"><span /> The innovation arena</p><Trophy size={44} /></div><h2>AgriTech<br /><em>Battlefield</em></h2><p className="battlefield-tag">Build it. Defend it. Scale it.</p><p className="battlefield-copy">Africa’s agricultural challenges need more than ideas. AgriTech Battlefield discovers and accelerates young innovators building practical solutions for the future of agriculture.</p><div className="funnel">{[['30+', 'applications'], ['20', 'shortlisted'], ['10', 'innovators'], ['05', 'finalists'], ['01', 'champion']].map(([n, label], i) => <div className="funnel-step" key={label}><strong>{n}</strong><span>{label}</span>{i < 4 && <ChevronRight className="funnel-arrow" />}</div>)}</div><div className="hero-buttons"><button className="button button-lime" onClick={() => navigate('/battlefield#apply')}>Enter the battlefield</button><button className="button button-outline" onClick={() => navigate('/battlefield')}>Explore competition</button></div></div></section>

        <section className="exhibit section" id="exhibit"><div className="container exhibit-card"><div className="exhibit-image" style={{ backgroundImage: `url(${farmerImage})` }}><div className="image-tag"><Sprout size={16} /> In the field</div></div><div className="exhibit-copy"><p className="eyebrow"><span /> Exhibition</p><h2>Don’t just tell us what you’re building.<br /><em>Show us.</em></h2><p>Put your technology, products and solutions directly in front of farmers, founders, students, institutions, investors and policymakers.</p><div className="category-list">{['AgriTech', 'Machinery', 'Seeds', 'Inputs', 'Processing', 'Drones', 'Finance', 'Software', 'Research'].map(item => <span key={item}>{item}</span>)}</div><button className="button button-dark" onClick={() => navigate('/exhibit')}>Enquire to exhibit</button></div></div></section>

        <section className="speaker-reveal section" id="speakers"><div className="container"><div className="speaker-reveal-heading"><div><h2>The voices shaping what comes next are <em>almost here.</em></h2><p>Builders, thinkers and decision-makers from across Africa's agricultural ecosystem will take the stage. We're keeping the names under wraps for now.</p></div><button className="button button-lime" onClick={() => navigate('/speakers')}>Guess the speakers</button></div><div className="speaker-reveal-grid">{speakerRevealSlots.slice(0, 4).map((slot, index) => <MysterySpeakerCard key={slot.clue} slot={slot} index={index} />)}</div></div></section>

        <section className="sponsor section" id="sponsor"><div className="container sponsor-grid"><div><p className="eyebrow light-eyebrow"><span /> Partnerships</p><h2>Put your brand where agriculture meets <em>innovation.</em></h2><button className="button button-lime" onClick={() => navigate('/sponsor')}>Become a sponsor</button></div><div className="benefit-list">{[['NETWORK', 'Meet the ecosystem.'], ['GENERATE LEADS', 'Meet tomorrow’s customers and partners.'], ['INNOVATE', 'Get closer to what’s next.'], ['GAIN EXPOSURE', 'Be visible to the people who matter.']].map(([title, text], i) => <div className="benefit" key={title}><span>0{i + 1}</span><div><strong>{title}</strong><p>{text}</p></div><ArrowUpRight size={18} /></div>)}</div></div></section>

        <section className="tickets section container" id="tickets"><div className="section-heading-row"><div><h2>Choose your <em>experience.</em></h2></div><p className="heading-note">Two ways to experience Africa’s agricultural technology gathering.</p></div><div className="ticket-grid tickets-two-option">
  <article className="ticket-card ticket-lime"><span className="ticket-label">Regular pass</span><strong>Free</strong><p>Experience the Fest.</p><ul><li>3-day festival access</li><li>Main sessions and keynotes</li><li>Exhibition and live demonstrations</li><li>AgriTech Battlefield</li><li>General networking and Meet & Mingle</li><li>Digital programme and eCertificate</li></ul><button className="ticket-apply" onClick={() => navigate('/tickets')}>Get Regular pass</button></article>
  <article className="ticket-card ticket-gold"><span className="ticket-label">Premium pass</span><strong>₦50,000</strong><p>Experience the Fest differently.</p><ul><li>Everything in Regular</li><li>Fast-track registration and premium credential</li><li>Priority seating and VIP Lounge</li><li>Premium networking and refreshments</li><li>Curated founder and investor introductions</li><li>Exclusive Founders Mixer access</li></ul><button className="ticket-apply" onClick={() => navigate('/tickets')}>Get Premium pass</button></article>
</div></section>

        <section className="home-mixer" aria-labelledby="home-mixer-title">
          <div className="container home-mixer-layout">
            <div className="home-mixer-copy">
              <p className="eyebrow"><span /> Founders’ Mixer · The Founders’ Table</p>
              <h2 id="home-mixer-title">Where ambitious founders meet their next connection.</h2>
              <p>Bring your ideas to the table. Meet selected founders, investors, innovators and ecosystem leaders for an evening of honest conversations and meaningful connections beyond the conference.</p>
              <button className="home-mixer-cta" onClick={() => navigate('/founders-mixer')}>Discover the Founders’ Mixer <ArrowUpRight size={20} /></button>
            </div>
            <aside className="home-mixer-panel" aria-label="Mixer experience">
              <h3>The right people. One table.</h3>
              <ul className="home-mixer-tags"><li>Founders</li><li>Investors</li><li>Innovators</li><li>Ecosystem leaders</li><li>Fresh perspectives</li><li>Meaningful connections</li></ul>
              <strong>Curated company. Open conversations.</strong>
              <p>An invitation-only evening with a selected guest list and limited capacity.</p>
              <div className="home-mixer-meta"><span>15 November 2026</span><span>Sunday evening · Kano</span></div>
            </aside>
          </div>
        </section>

        <section className="newsletter"><div className="container newsletter-inner"><div><p className="eyebrow"><span /> Keep in the loop</p><h2>Stay close to <em>what’s next.</em></h2></div><form onSubmit={async (e) => { e.preventDefault(); const form = new FormData(e.currentTarget); await subscribeToNewsletter({ email: String(form.get('email')) }); e.currentTarget.reset(); }}><input name="email" required type="email" placeholder="Your email address" aria-label="Your email address" /><button type="submit">Stay updated</button></form></div></section>

        <section className="faq section container"><div><p className="eyebrow"><span /> Good to know</p><h2>Frequently<br /><em>asked.</em></h2><button className="arrow-link" onClick={() => navigate('/faq')}>Contact the team</button></div><div className="faq-list">{faqItems.slice(0, 5).map(([question, answer], i) => <div className={`faq-item ${faqOpen === i ? 'open' : ''}`} key={question}><button onClick={() => setFaqOpen(faqOpen === i ? null : i)}><span>0{i + 1}</span><strong>{question}</strong></button>{faqOpen === i && <p>{answer}</p>}</div>)}</div></section>
      </main>


      <footer className="footer"><div className="container footer-grid"><div className="footer-brand"><Mark light /><p>Where the future of<br />Food begins.</p><span>© 2026 e360 Africa — Efficience 360 Technologies Ltd.</span></div><div className="footer-col"><b>Explore</b><button onClick={() => scrollTo('about')}>About</button><button onClick={() => scrollTo('programme')}>Programme</button><button onClick={() => scrollTo('speakers')}>Speakers</button><button onClick={() => scrollTo('battlefield')}>Battlefield</button></div><div className="footer-col"><b>Get involved</b><button onClick={() => scrollTo('tickets')}>Tickets</button><button onClick={() => scrollTo('sponsor')}>Sponsor</button><button onClick={() => scrollTo('exhibit')}>Exhibit</button><button onClick={() => navigate('/media')}>Media pass</button></div><div className="footer-col"><b>Connect</b><button onClick={() => navigate('/newsletter')}>Newsletter</button><button onClick={() => navigate('/contact')}>Contact</button><a href="https://www.instagram.com/agritechfest_/" target="_blank" rel="noreferrer">Instagram: @Agritechfest_</a><a href="https://www.facebook.com/Agritechfest" target="_blank" rel="noreferrer">Facebook: Agritechfest</a></div></div><div className="container footer-bottom"><span><button onClick={() => navigate('/privacy')}>Privacy</button> · <button onClick={() => navigate('/terms')}>Terms</button></span><span>Made for the people building tomorrow.</span><button onClick={() => scrollTo('top')}>Back to top</button></div></footer>
    </div>
  );
}

function AboutPage() {
  const navigateTo = (path: string) => navigate(path);
  return (
    <PageShell title="About AgriTech Fest" subtitle="The big idea">
      <div className="about-page">
        <section className="about-page-hero">
          <div className="about-page-story"><span className="about-page-label">Built around practical progress</span><h2>Africa is building <em>what comes next.</em></h2><p>AgriTech Fest connects farmers, founders, researchers, investors, policymakers and students around practical ideas that can move agriculture forward.</p><div className="about-page-actions"><button className="button button-lime" onClick={() => navigateTo('/programme')}>See the full programme</button><span><CalendarDays size={17} /> Kano · 12–14 November 2026</span></div></div>
          <div className="about-page-image" style={{ backgroundImage: `linear-gradient(180deg,transparent,rgba(7,25,35,.72)),url(${farmerImage})` }}><div><strong>Working event</strong><span>Ideas · demonstrations · relationships</span></div></div>
        </section>
        <section className="about-page-copy"><p>It is designed as a working event, not just a conference: a place to discover useful technology, learn from people doing the work and build relationships that can lead to pilots, partnerships and investment.</p><p>Kano gives the festival access to a dense agricultural ecosystem, strong institutions and the kind of energy that makes innovation feel grounded in reality.</p></section>
        <section className="about-page-numbers" aria-label="Event at a glance"><CountUpStat value={3} label="days" /><CountUpStat value={3} label="experiences" /><CountUpStat value={2000} label="participants" /><CountUpStat value={20} suffix="+" label="exhibitors" /><CountUpStat value={10} suffix="+" label="speakers" /><CountUpStat value={5} label="battlefield finalists" /></section>
        <section className="about-page-promise"><header><p className="eyebrow light-eyebrow"><span /> What the festival creates</p><h2>Come for the ideas.<br /><em>Leave with momentum.</em></h2></header><div>{promiseItems.map(([title, subtitle, copy], index) => <article key={title}><span>0{index + 1}</span><small>{title}</small><h3>{subtitle}</h3><p>{copy}</p></article>)}</div></section>
      </div>
    </PageShell>
  );
}

function ProgrammePage() {
  const [activeDay, setActiveDay] = useState(0);
  const day = programmeDays[activeDay];
  const [venue, focus] = day.intro.split('. Focus: ');

  return (
    <PageShell title="Full Programme" subtitle="Event programme">
      <div className="programme-page">
        <header className="programme-page-intro">
          <div><span className="programme-date"><CalendarDays size={18} /> 12–14 November 2026</span><h2>Three days.<br /><em>One connected journey.</em></h2></div>
          <p>This is the full three-day schedule for AgriTech Fest 2026. Each day has its own focus, venue and audience, with a mix of keynotes, panels, training, exhibition time and fun engagement moments.</p>
        </header>

        <nav className="programme-day-switcher" aria-label="Choose programme day">
          {programmeDays.map((item, index) => {
            const [dayNumber, dayName] = item.tab.split(' · ');
            return <button key={item.tab} className={activeDay === index ? 'active' : ''} onClick={() => setActiveDay(index)} aria-pressed={activeDay === index}><span>{dayNumber}</span><strong>{dayName}</strong><small>{item.sessions.length} sessions</small></button>;
          })}
        </nav>

        <section className="programme-day-panel" aria-live="polite">
          <aside className="programme-day-summary">
            <span className="programme-day-number">0{activeDay + 1}</span>
            <p>{day.tab}</p>
            <h3>{focus?.replace(/\.$/, '') ?? day.intro}</h3>
            <div><strong>Venue</strong><span>{venue.replace('Venue: ', '')}</span></div>
            <div><strong>Schedule</strong><span>{day.sessions[0][0]} – {day.sessions[day.sessions.length - 1][0]}</span></div>
          </aside>
          <div className="programme-schedule">
            {day.sessions.map(([time, title, description], index) => <article className="programme-session" key={`${day.tab}-${time}-${title}`}><div className="programme-session-time"><span>{String(index + 1).padStart(2, '0')}</span><time>{time}</time></div><div><h3>{title}</h3><p>{description}</p></div></article>)}
          </div>
        </section>
      </div>
    </PageShell>
  );
}

function SponsorPage() {
  const [sent, setSent] = useState(false);

  return (
    <PageShell title="Become a Sponsor" subtitle="Partnerships">
      <div className="sponsor-grid" style={{ alignItems: 'start' }}>
        <div>
          <h2>Put your brand where agriculture meets innovation.</h2>
          <p className="heading-note" style={{ maxWidth: 580 }}>Sponsorship opens access to the ecosystem, visibility with the right audience and opportunities to support the next generation of agricultural problem-solvers.</p>
          <div className="benefit-list" style={{ marginTop: 28 }}>
            {[['NETWORK', 'Meet the ecosystem.'], ['GENERATE LEADS', 'Meet tomorrow’s customers and partners.'], ['INNOVATE', 'Get closer to what’s next.'], ['GAIN EXPOSURE', 'Be visible to the people who matter.']].map(([title, text], i) => <div className="benefit" key={title}><span>0{i + 1}</span><div><strong>{title}</strong><p>{text}</p></div></div>)}
          </div>
        </div>

        <form className="ticket-card" style={{ gap: 14 }} onSubmit={async (e) => { e.preventDefault(); const form = new FormData(e.currentTarget); await createEnquiry({ enquiry_type: 'sponsor', organisation: String(form.get('organisation')), name: String(form.get('name')), email: String(form.get('email')), phone: String(form.get('phone') || ''), message: String(form.get('message') || '') }); setSent(true); e.currentTarget.reset(); }}>
          <span className="ticket-label">Sponsor enquiry</span>
          <input name="organisation" required placeholder="Organisation name" />
          <input name="name" required placeholder="Contact name" />
          <input name="email" required type="email" placeholder="Email address" />
          <input name="phone" placeholder="Phone number" />
          <select defaultValue="">
            <option value="" disabled>Sponsorship interest</option>
            <option>Battlefield</option>
            <option>Programme</option>
            <option>Tickets</option>
            <option>Exhibition</option>
          </select>
          <textarea name="message" rows={5} placeholder="Tell us what you want to support" />
          <button className="ticket-apply" type="submit">Submit sponsor enquiry</button>
          {sent && <p className="heading-note">Thanks. The team will reach out with sponsorship options.</p>}
        </form>
      </div>
    </PageShell>
  );
}

function TicketsPage() {
  return <PageShell title="Get Your Ticket" subtitle="Ticketing"><TicketRegistration onComplete={() => navigate('/ticket-success')} /></PageShell>;
}
function BattlefieldPage() {
  const [applicationOpen, setApplicationOpen] = useState(() => Boolean(localStorage.getItem('agritech-battlefield-draft-v1')) || window.location.hash === '#apply');

  const openApplication = () => {
    setApplicationOpen(true);
    window.history.replaceState({}, '', '/battlefield#apply');
    window.setTimeout(() => document.getElementById('battleform')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };
  const categories = [
    { title: 'Precision Agriculture & Smart Farming', text: 'Data, sensors, drones and digital tools that help farmers make better field decisions.' },
    { title: 'Mechanisation & Farm Tools', text: 'Accessible equipment and practical tools that increase productivity and reduce physical labour.' },
    { title: 'Climate-Smart Agriculture', text: 'Solutions that improve resilience, protect resources and help farms adapt to a changing climate.' },
    { title: 'Post-Harvest & Food Processing', text: 'Storage, processing, logistics and preservation innovations that reduce loss and add value.' },
    { title: 'Agricultural Finance & Market Access', text: 'Financial products, market connections and platforms that expand opportunity for producers.' },
    { title: 'Livestock & Animal Agriculture', text: 'Technology and systems improving animal health, productivity, traceability and welfare.' },
    { title: 'Agricultural Biotechnology & Inputs', text: 'Better seeds, diagnostics, crop inputs and biological tools designed for African conditions.' },
    { title: 'Food Systems & Circular Agriculture', text: 'Ideas that turn waste into value and make food production and distribution more sustainable.' },
  ];
  const stages = ['Application', 'Screening', 'Mentoring', 'Technical interrogation', 'Preliminary pitch', 'Grand finale'];

  return (
    <PageShell title="AgriTech Battlefield" subtitle="Innovation pitch arena">
      <section className="battlefield-page-hero" aria-labelledby="battlefield-hero-title">
        <div className="battlefield-page-copy">
          <p className="battlefield-page-label"><span /> Build It. Defend It. Scale It.</p>
          <h2 id="battlefield-hero-title">Where ideas face the <em>real world.</em></h2>
          <p>The flagship student innovation competition of Kano Agri-Tech Fest 2026. This is where young innovators prove that their ideas can survive the real world.</p>
          <div className="battlefield-page-actions"><button className="button button-lime" onClick={openApplication}>{applicationOpen ? 'Continue application' : 'Enter the Battlefield'}</button><span>15–20 minutes · progress saves automatically</span></div>
        </div>
        <div className="battlefield-page-visual" role="img" aria-label="Young agricultural innovators working in the field">
          <div className="battlefield-visual-badge"><Trophy size={20} /><span>AgriTech Fest 2026</span><strong>Innovation arena</strong></div>
        </div>
        <div className="battlefield-page-funnel" aria-label="Competition selection funnel">
          {[['30+', 'applications'], ['20', 'shortlisted'], ['10', 'innovators'], ['5', 'finalists'], ['1', 'champion']].map(([number, label]) => <div key={label}><strong>{number}</strong><span>{label}</span></div>)}
        </div>
      </section>

      <section className="battlefield-overview section">
        <div className="battlefield-overview-heading"><p className="eyebrow"><span /> What we look for</p><h2>The arena is built for <em>real solutions.</em></h2></div>
        <div className="battlefield-criteria"><p>Participants must show a real agricultural problem, a clear user, technical feasibility, African context awareness and potential for measurable impact.</p><div className="battlefield-criteria-grid">{['A real agricultural problem', 'A clearly defined user', 'Technical feasibility', 'African context awareness', 'Measurable impact potential'].map((item, index) => <div key={item}><span>0{index + 1}</span><strong>{item}</strong></div>)}</div></div>
      </section>

      <section className="battlefield-journey section" aria-labelledby="battlefield-journey-title">
        <div className="battlefield-section-intro"><p className="eyebrow light-eyebrow"><span /> The selection journey</p><h2 id="battlefield-journey-title">From application to the <em>grand stage.</em></h2><p>The programme moves innovators from application to screening, mentoring, technical interrogation, preliminary pitching and a grand finale before investors and policymakers.</p></div>
        <ol>{stages.map((stage, index) => <li key={stage}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{stage}</strong><small>{index === 0 ? 'Tell us what you are building' : index === stages.length - 1 ? 'Pitch before investors and policymakers' : 'Advance through the selection process'}</small></div></li>)}</ol>
      </section>

      <section className="battlefield-categories section" aria-labelledby="battlefield-categories-title">
        <div className="battlefield-section-heading"><div><p className="eyebrow"><span /> Innovation categories</p><h2 id="battlefield-categories-title">Eight pathways to <em>impact.</em></h2></div><p>Choose the category that best represents the agricultural problem your innovation addresses.</p></div>
<div className="battlefield-category-grid">{categories.map((item, index) => <article key={item.title} tabIndex={0}><span>{String(index + 1).padStart(2, '0')}</span><div className="battlefield-category-copy"><Sprout size={21} /><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div>
      </section>

      <section className="battlefield-application-zone section" id="apply" aria-label="Battlefield application">
        {applicationOpen ? <BattlefieldApplication /> : <div className="battlefield-application-invite"><div><p className="eyebrow light-eyebrow"><span /> Your application</p><h2>Ready to build, defend and scale?</h2><p>The application takes about 15–20 minutes. Your answers save automatically as you go, so you can return at any time.</p></div><div className="battlefield-application-meta"><span><Sparkles size={17} /> Conversational application</span><span><CalendarDays size={17} /> Progress saved on this device</span><button className="button button-lime" type="button" onClick={openApplication}>Enter the Battlefield</button></div></div>}
      </section>
    </PageShell>
  );
}

const speakerRevealSlots = [
  { clue: 'A voice changing how Africa grows', field: 'The field' },
  { clue: 'A founder building beyond the obvious', field: 'Innovation' },
  { clue: 'A decision-maker moving capital', field: 'Investment' },
  { clue: 'A leader shaping food systems', field: 'Policy' },
  { clue: 'A researcher turning evidence into action', field: 'Research' },
  { clue: 'A technologist designing for scale', field: 'Technology' },
];

function MysterySpeakerCard({ slot, index }: { slot: (typeof speakerRevealSlots)[number]; index: number }) {
  return <article className={`mystery-speaker mystery-speaker-${(index % 3) + 1}`}><div className="mystery-speaker-art" aria-hidden="true"><span className="mystery-speaker-head" /><span className="mystery-speaker-body" /><strong>?</strong></div><div className="mystery-speaker-copy"><span>{slot.field}</span><h3>To be revealed</h3><p>{slot.clue}</p></div></article>;
}

const exhibitors = [
  { name: 'AgroDrone Systems', type: 'Technology', booth: 'A12', website: 'agrodrones.example', what: 'Drone mapping, crop monitoring and spraying.', category: 'technology' },
  { name: 'FarmLink Equipment', type: 'Equipment', booth: 'B04', website: 'farmlink.example', what: 'Smallholder machinery and fabrication.', category: 'equipment' },
  { name: 'SeedForward', type: 'Inputs', booth: 'C09', website: 'seedforward.example', what: 'Improved seeds and crop inputs.', category: 'inputs' },
  { name: 'HarvestPay', type: 'Finance', booth: 'D02', website: 'harvestpay.example', what: 'Credit, insurance and payment tools.', category: 'finance' },
  { name: 'ColdStore Pro', type: 'Processing', booth: 'E11', website: 'coldstore.example', what: 'Cold-chain and storage solutions.', category: 'processing' },
  { name: 'SoilLab Africa', type: 'Research', booth: 'F07', website: 'soillab.example', what: 'Testing, diagnostics and advisory.', category: 'research' },
  { name: 'GreenPulse Startup', type: 'Startup', booth: 'G15', website: 'greenpulse.example', what: 'Farm management software for youth-led farms.', category: 'startup' },
];

const faqItems = [
  ['What is AgriTech Fest?', 'AgriTech Fest is e360 Africa’s flagship agricultural technology conference, bringing together ambitious innovators, founders, investors, farmers, operators, researchers, policymakers, development organisations, students and technology enthusiasts to connect, collaborate and celebrate innovation shaping agriculture across Africa.'],
  ['When is AgriTech Fest 2026?', 'AgriTech Fest 2026 takes place from 12–14 November 2026 in Kano, Nigeria.'],
  ['Is attendance virtual or in-person?', 'AgriTech Fest 2026 is primarily an in-person experience, designed around face-to-face conversations, exhibitions, demonstrations and networking.'],
  ['Why should I attend?', 'Come to discover emerging agricultural technologies, learn from industry leaders, meet potential customers and partners, connect with investors and innovators, experience practical demonstrations and build relationships across the agricultural ecosystem.'],
  ['How can I attend?', 'Choose the ticket or pass that best fits you on our Ticket page and complete registration. Some experiences have limited capacity or require separate invitations.'],
  ['How can I prepare for the conference?', 'The first thing to do is secure your seat. Once registered, sign up for the AgriTech Fest newsletter for speaker announcements, programme updates, side events and other important information. Explore the announced speakers, exhibitors and programme beforehand so you can identify the people and sessions most relevant to you.'],
  ['Who can attend?', 'Students, farmers, founders, entrepreneurs, investors, researchers, agricultural professionals, corporate organisations, government representatives, development organisations and anyone actively interested in the future of African agriculture.'],
  ['How can my company become a sponsor?', 'Complete the sponsorship enquiry form and our partnerships team will contact you to discuss available opportunities and activation packages.'],
  ['I have another question.', 'Contact the AgriTech Fest team at info@e360.africa.'],
];

function SpeakersPage() {
  return (
    <PageShell title="Speakers" subtitle="">
      <div className="speakers-page speaker-reveal-page">
        <header className="speaker-reveal-page-hero"><span>Names dropping soon</span><h2>Can you guess who is taking <em>the stage?</em></h2><p>A bold mix of founders, farmers, investors, researchers, technologists and public leaders is coming to Kano. The first reveal is closer than you think.</p><button className="button button-lime" onClick={() => navigate('/newsletter')}>Be first to know</button></header>
        <div className="speaker-reveal-grid speaker-reveal-grid-full">{speakerRevealSlots.map((slot, index) => <MysterySpeakerCard key={slot.clue} slot={slot} index={index} />)}</div>
        <section className="speaker-reveal-note"><span>Think you know someone on the list?</span><h2>Watch this space.</h2><p>Speaker announcements will be shared here and with newsletter subscribers first.</p></section>
      </div>
    </PageShell>
  );
}

function ExhibitPage() {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(exhibitors[0]);
  const filtered = exhibitors.filter((item) => filter === 'all' || item.category === filter);
  return (
    <PageShell title="Exhibitor Directory" subtitle="Exhibition">
      <div className="exhibitor-page">
        <header className="exhibitor-page-intro"><div><span>{exhibitors.length} exhibiting organisations</span><h2>Discover the technology <em>on the floor.</em></h2></div><p>Explore the companies, tools and research being presented at AgriTech Fest, then select an exhibitor to see its booth and profile.</p></header>
        <nav className="exhibitor-filters" aria-label="Filter exhibitors">{['all','technology','equipment','inputs','finance','processing','research','startup'].map(item => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)} aria-pressed={filter === item}>{item}</button>)}</nav>
        <div className="exhibitor-workspace">
          <div className="exhibitor-list" aria-live="polite">{filtered.map((item,index) => <button key={item.name} className={`exhibitor-list-card ${selected.name === item.name ? 'selected' : ''}`} onClick={() => setSelected(item)}><span>{String(index + 1).padStart(2,'0')}</span><div><small>{item.type}</small><h3>{item.name}</h3><p>{item.what}</p></div><strong>Booth {item.booth}</strong></button>)}</div>
          <aside className="exhibitor-profile"><span className="exhibitor-profile-label">Company profile</span><div className="exhibitor-profile-mark"><Sprout size={27} /></div><small>{selected.type}</small><h2>{selected.name}</h2><p>{selected.what}</p><div><span>Booth</span><strong>{selected.booth}</strong></div><div><span>Website</span><strong>{selected.website}</strong></div><button type="button">Visit website</button></aside>
        </div>
        <section className="exhibitor-cta"><div><span>Want to exhibit?</span><h2>Put your solution in front of the ecosystem.</h2></div><button className="button button-lime" onClick={() => navigate('/get-involved')}>Enquire to exhibit</button></section>
      </div>
    </PageShell>
  );
}

function SponsorsPartnersPage() {
  const partnerGroups = [
    ['Official Partners', ['STERLING BANK', 'MTN']],
    ['Supporting Partners', ['e360 AFRICA', 'KANO STATE']],
    ['Ecosystem Partners', ['BUK', 'AGRO INNOVATE']],
    ['Media Partners', ['Radio Kano', 'AgriNews Hub']],
    ['Community Partners', ['Young Farmers Network', 'Agro Startups Hub']],
  ] as const;
  const benefits = [
    ['NETWORK', 'Meet founders, investors, government leaders, researchers, farmers and organisations shaping African agriculture.'],
    ['GENERATE LEADS', 'Build relationships with decision-makers and organisations looking for solutions.'],
    ['INNOVATE', 'Discover emerging technologies, startups, talent and opportunities before the mainstream.'],
    ['GAIN EXPOSURE', 'Position your organisation at the centre of technology, food systems, youth and agricultural transformation.'],
  ] as const;
  return (
    <PageShell title="Sponsors & Partners" subtitle="Commercial visibility">
      <div className="partners-page">
        <section className="partners-page-hero"><div><span>Partnership with purpose</span><h2>Put your organisation where agriculture meets <em>innovation.</em></h2><p>Build meaningful visibility and relationships with the people shaping technology, food systems, youth and agricultural transformation.</p><div><button className="button button-lime" onClick={() => navigate('/sponsor')}>Become a sponsor</button><a href="/downloads/agritech-fest-2026-sponsorship-exhibitor-prospectus.pdf" download>Download sponsorship prospectus</a></div></div><aside><small>Headline partner</small><strong>STERLING <span>BANK</span></strong><p>Supporting the conversations and connections moving African agriculture forward.</p></aside></section>
        <section className="partners-benefits">{benefits.map(([title,copy],index) => <article key={title}><span>0{index + 1}</span><Sparkles size={19} /><h3>{title}</h3><p>{copy}</p></article>)}</section>
        <section className="partners-roster"><header><p className="eyebrow"><span /> The ecosystem behind the festival</p><h2>Built with partners who believe in <em>what comes next.</em></h2></header><div>{partnerGroups.map(([title,items]) => <section key={title}><h3>{title}</h3><div>{items.map(item => <span key={item}>{item}</span>)}</div></section>)}</div></section>
        <section className="partners-marquee"><span>Supported by</span><PartnerMarquee /></section>
      </div>
    </PageShell>
  );
}

function FoundersMixerPage() {
  return (
    <PageShell title="The Founders’ Table" subtitle="Founders Mixer">
      <div className="battlefield" style={{ borderRadius: 24, marginTop: 0 }}>
        <div className="container battlefield-inner">
          <p className="battlefield-tag">The conference ends. The conversations don’t.</p>
          <p className="battlefield-copy">Sunday, 15 November 2026. Invitation-only. Strictly limited access for selected founders, investors, innovators and ecosystem leaders.</p>
          <button className="button button-lime" onClick={() => navigate('/contact')}>Request an invitation</button>
        </div>
      </div>
    </PageShell>
  );
}

function MediaPage() {
  const [sent, setSent] = useState(false);
  return (
    <PageShell title="Media Accreditation" subtitle="Media">
      <form className="ticket-card" style={{ gap: 14, maxWidth: 820 }} onSubmit={async (e) => { e.preventDefault(); const form = new FormData(e.currentTarget); const payload = Object.fromEntries(form.entries()); await createEnquiry({ enquiry_type: 'media', name: String(form.get('Name')), email: String(form.get('Email')), organisation: String(form.get('Media Organisation') || ''), phone: String(form.get('Phone') || ''), payload }); setSent(true); e.currentTarget.reset(); }}>
        {['Name', 'Media Organisation', 'Job Title', 'Email', 'Phone', 'Country', 'Publication / Platform', 'Website', 'Social profile', 'Coverage type', 'Estimated audience/reach', 'Previous work link', 'Days attending', 'Special interview requests'].map((label) => <input key={label} name={label} type={label === 'Email' ? 'email' : 'text'} required={label === 'Name' || label === 'Email'} placeholder={label} />)}
        <button className="ticket-apply" type="submit">SUBMIT MEDIA APPLICATION</button>
        <p className="heading-note">Submitting an application does not guarantee accreditation.</p>
        {sent && <p className="heading-note">Thanks. The media team will review your application.</p>}
      </form>
    </PageShell>
  );
}

function GetInvolvedPage() {
  const cards = [
    ['STARTUPS', 'Building an agricultural solution?', 'Take your innovation through the Battlefield application and selection journey.', '/battlefield', 'Apply as a startup'],
    ['ENTERPRISES', 'Want your organisation represented?', 'Connect your organisation with the people, ideas and opportunities shaping African agriculture.', '/contact', 'Enterprise enquiry'],
    ['EXHIBITORS', 'Put your technology in front of the ecosystem.', 'Demonstrate products, meet buyers and make your solution tangible for attendees.', '/exhibit', 'Enquire to exhibit'],
    ['SPONSORS', 'Put your brand behind the future.', 'Build visibility and meaningful relationships across the agricultural innovation ecosystem.', '/sponsors-partners', 'Become a sponsor'],
    ['PARTNERS', 'Help us create measurable agricultural impact.', 'Collaborate on programmes, access, research and lasting outcomes beyond the event.', '/sponsors-partners', 'Partner with us'],
    ['MEDIA', 'Cover one of Africa’s emerging agricultural technology gatherings.', 'Access the stories, innovators and conversations defining what comes next.', '/media', 'Get media pass'],
  ] as const;

  return (
    <PageShell title="Get Involved" subtitle="Choose your pathway">
      <div className="involved-page">
        <header className="involved-page-intro"><div><span>Six ways to participate</span><h2>Find your place in the <em>ecosystem.</em></h2></div><p>There’s more than one way to be part of AgriTech Fest. Choose the pathway that matches what you want to contribute, discover or build.</p></header>
        <div className="involved-grid">
          {cards.map(([title, heading, description, path, cta], index) => (
            <article key={title} className="involved-card">
              <div className="involved-card-top"><span>{String(index + 1).padStart(2, '0')}</span><Sprout size={20} /></div>
              <small>{title}</small><h3>{heading}</h3><p>{description}</p>
              <button onClick={() => navigate(path)}>{cta}</button>
            </article>
          ))}
        </div>
        <section className="involved-contact"><div><span>Not sure where you fit?</span><h2>Let’s find the right way to work together.</h2></div><button className="button button-lime" onClick={() => navigate('/contact')}>Contact the team</button></section>
      </div>
    </PageShell>
  );
}

function FaqPage() {
  const [open, setOpen] = useState(0);
  return (
    <PageShell title="Frequently Asked Questions" subtitle="FAQ">
      <div className="faq-list">
        {faqItems.map(([q, a], i) => <div key={q} className={`faq-item ${open === i ? 'open' : ''}`}><button onClick={() => setOpen(open === i ? -1 : i)}><span>0{i + 1}</span><strong>{q}</strong></button>{open === i && <p>{a}</p>}</div>)}
      </div>
    </PageShell>
  );
}

function NewsletterPage() {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <PageShell title="Newsletter" subtitle="">
      <div className="newsletter-page">
        <section className="newsletter-page-hero">
          <div className="newsletter-page-copy">
            <span className="newsletter-page-status"><i /> The signal from AgriTech Fest</span>
            <h2>Know what’s next <em>before everyone else.</em></h2>
            <p>Speaker reveals, programme drops, Battlefield news and the opportunities worth showing up for—sent with purpose, never noise.</p>
            <div className="newsletter-page-promise">
              <div><strong>01</strong><span>Speaker reveals</span></div>
              <div><strong>02</strong><span>Programme updates</span></div>
              <div><strong>03</strong><span>Access alerts</span></div>
            </div>
          </div>

          <div className="newsletter-signup-card">
            {subscribed ? (
              <div className="newsletter-success" role="status">
                <span>You're on the list</span>
                <h3>Welcome to the inside track.</h3>
                <p>We’ll send the next AgriTech Fest update straight to your inbox.</p>
                <button type="button" onClick={() => setSubscribed(false)}>Add another email</button>
              </div>
            ) : (
              <>
                <header><span>Join the list</span><h3>Stay close to the Fest.</h3><p>Tell us where to reach you. The last two fields are optional.</p></header>
                <form className="newsletter-page-form" onSubmit={async (event) => {
                  event.preventDefault();
                  const formElement = event.currentTarget;
                  const form = new FormData(formElement);
                  await subscribeToNewsletter({
                    first_name: String(form.get('first_name') || ''),
                    email: String(form.get('email')),
                    organisation: String(form.get('organisation') || ''),
                    job_title: String(form.get('job_title') || ''),
                  });
                  formElement.reset();
                  setSubscribed(true);
                }}>
                  <label><span>First name</span><input name="first_name" autoComplete="given-name" placeholder="What should we call you?" /></label>
                  <label><span>Email address <b>*</b></span><input name="email" required type="email" autoComplete="email" placeholder="you@example.com" /></label>
                  <label><span>Organisation or school <small>Optional</small></span><input name="organisation" autoComplete="organization" placeholder="Where are you coming from?" /></label>
                  <label><span>Role or field of interest <small>Optional</small></span><input name="job_title" autoComplete="organization-title" placeholder="Student, farmer, founder..." /></label>
                  <button type="submit">Keep me in the loop <span>→</span></button>
                  <p>By subscribing, you agree to receive event updates. Unsubscribe whenever you like.</p>
                </form>
              </>
            )}
          </div>
        </section>

        <section className="newsletter-preview">
          <div><span>In your inbox</span><h2>Useful updates.<br />No filler.</h2></div>
          <div className="newsletter-preview-list">
            <article><span>Reveals</span><strong>The names taking the stage</strong><p>Meet speakers as soon as they are announced.</p></article>
            <article><span>Plan</span><strong>The moments worth your time</strong><p>Programme highlights and timely schedule updates.</p></article>
            <article><span>Access</span><strong>The opportunities with a deadline</strong><p>Applications, tickets and limited-capacity experiences.</p></article>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

function ContactPage() {
  return (
    <PageShell title="Contact" subtitle="Connect with the team">
      <form className="ticket-card" style={{ gap: 14, maxWidth: 760 }} onSubmit={async (e) => { e.preventDefault(); const form = new FormData(e.currentTarget); await createEnquiry({ enquiry_type: 'contact', name: String(form.get('Name')), email: String(form.get('Email')), phone: String(form.get('Phone') || ''), organisation: String(form.get('Organisation') || ''), message: String(form.get('Message') || '') }); e.currentTarget.reset(); }}>
        {['Name', 'Email', 'Phone', 'Organisation', 'Message'].map((label) => label === 'Message' ? <textarea key={label} name={label} rows={5} placeholder={label} /> : <input key={label} name={label} type={label === 'Email' ? 'email' : 'text'} required={label === 'Name' || label === 'Email'} placeholder={label} />)}
        <button className="ticket-apply" type="submit">SEND MESSAGE</button>
      </form>
    </PageShell>
  );
}

function PrivacyPage() {
  return <PageShell title="Privacy Policy" subtitle="Legal"><div className="about-copy"><p>We only collect information needed to manage registrations, applications, accreditation and event communication.</p></div></PageShell>;
}

function TermsPage() {
  return <PageShell title="Terms & Conditions" subtitle="Legal"><div className="about-copy"><p>Event access, accreditation, applications and sponsor participation are subject to review, capacity and organiser approval.</p></div></PageShell>;
}

function TicketSuccessPage() {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('agritech-ticket') : null;
  const ticket = stored ? JSON.parse(stored) as { id: string; name: string; email: string; type: string; day: string } : null;

  if (!ticket) {
    return (
      <PageShell title="Your ticket" subtitle="Registration">
        <div className="ticket-card" style={{ gap: 14, maxWidth: 700 }}>
          <span className="ticket-label">No ticket found</span>
          <strong>Complete registration to create your pass.</strong>
          <p>Your ticket will appear here as soon as your registration is confirmed.</p>
          <button className="ticket-apply" onClick={() => navigate('/tickets')}>Go to ticket registration</button>
        </div>
      </PageShell>
    );
  }

  return (
    <div className="site-shell">
      <SiteHeader navigateTo={navigate} />
      <main className="ticket-success-page">
        <TicketPass ticket={ticket} onBack={() => navigate('/')} />
      </main>
      <SiteFooter navigateTo={navigate} />
    </div>
  );
}
function App() {
  const siteLive = useSiteLive();
  const [location, setLocation] = useState({ pathname: window.location.pathname, hash: window.location.hash });

  useEffect(() => {
    const onPopState = () => setLocation({ pathname: window.location.pathname, hash: window.location.hash });
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const pageTitles: Record<string, string> = {
      '/': 'AgriTech Fest 2026 — Where the Future of Food Begins',
      '/about': 'About — AgriTech Fest 2026',
      '/programme': 'Programme — AgriTech Fest 2026',
      '/speakers': 'Speakers & Keynotes — AgriTech Fest 2026',
      '/exhibit': 'Exhibitor Directory — AgriTech Fest 2026',
      '/sponsors-partners': 'Sponsors & Partners — AgriTech Fest 2026',
      '/sponsor': 'Become a Sponsor — AgriTech Fest 2026',
      '/founders-mixer': 'The Founders’ Table — AgriTech Fest 2026',
      '/tickets': 'Get Your Ticket — AgriTech Fest 2026',
      '/ticket-success': 'Your Ticket — AgriTech Fest 2026',
      '/battlefield': 'AgriTech Battlefield — AgriTech Fest 2026',
      '/media': 'Media Accreditation — AgriTech Fest 2026',
      '/get-involved': 'Get Involved — AgriTech Fest 2026',
      '/faq': 'Frequently Asked Questions — AgriTech Fest 2026',
      '/newsletter': 'Newsletter — AgriTech Fest 2026',
      '/contact': 'Contact — AgriTech Fest 2026',
      '/privacy': 'Privacy Policy — AgriTech Fest 2026',
      '/terms': 'Terms & Conditions — AgriTech Fest 2026',
    };
    document.title = location.pathname.startsWith('/admin') ? 'Admin Dashboard — AgriTech Fest 2026' : (!siteLive || location.pathname === '/maintenance' ? 'Something good is growing — AgriTech Fest 2026' : (pageTitles[location.pathname] ?? 'AgriTech Fest 2026'));
  }, [location.pathname, siteLive]);

  useEffect(() => {
    const id = location.hash.replace('#', '');
    if (id) {
      window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }));
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname, location.hash]);

  if (location.pathname === '/admin' || location.pathname.startsWith('/admin/')) return <Admin />;
  if (!siteLive || location.pathname === '/maintenance') return <MaintenancePage />;
  if (location.pathname === '/programme') return <ProgrammePage />;
  if (location.pathname === '/about') return <AboutPage />;
  if (location.pathname === '/speakers') return <SpeakersPage />;
  if (location.pathname === '/exhibit') return <ExhibitPage />;
  if (location.pathname === '/sponsors-partners') return <SponsorsPartnersPage />;
  if (location.pathname === '/sponsor') return <SponsorPage />;
  if (location.pathname === '/founders-mixer') return <FoundersMixerPage />;
  if (location.pathname === '/tickets') return <TicketsPage />;
  if (location.pathname === '/ticket-success') return <TicketSuccessPage />;
  if (location.pathname === '/battlefield') return <BattlefieldPage />;
  if (location.pathname === '/media') return <MediaPage />;
  if (location.pathname === '/get-involved') return <GetInvolvedPage />;
  if (location.pathname === '/faq') return <FaqPage />;
  if (location.pathname === '/newsletter') return <NewsletterPage />;
  if (location.pathname === '/contact') return <ContactPage />;
  if (location.pathname === '/privacy') return <PrivacyPage />;
  if (location.pathname === '/terms') return <TermsPage />;
  return <HomePage />;
}

export default App;





