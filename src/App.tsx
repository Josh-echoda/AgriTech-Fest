import { useEffect, useState, type ReactNode } from 'react';
import {
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleArrowUp,
  Menu,
  MoveRight,
  Play,
  Sparkles,
  Sprout,
  Trophy,
  Users,
  X,
} from 'lucide-react';

const heroImage = 'https://images.pexels.com/photos/34182315/pexels-photo-34182315.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const farmerImage = 'https://images.pexels.com/photos/34182310/pexels-photo-34182310.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const eventImage = 'https://images.pexels.com/photos/8730858/pexels-photo-8730858.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

const navItems = ['About', 'Programme', 'Speakers', 'Battlefield', 'Exhibit', 'Sponsor', 'Tickets'];
const logos = ['STERLING BANK', 'MTN', 'e360 AFRICA', 'KANO STATE', 'BUK', 'AGRO INNOVATE'];
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
  about: '/about',
  programme: '/programme',
  sponsor: '/sponsor',
  tickets: '/tickets',
  battlefield: '/battlefield',
  promise: '/about',
};

function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function hashString(value: string) {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function TicketQr({ value }: { value: string }) {
  const size = 21;
  const cell = 10;
  const isDark = (x: number, y: number) => {
    const inFinder =
      (x < 7 && y < 7) ||
      (x >= size - 7 && y < 7) ||
      (x < 7 && y >= size - 7);

    if (inFinder) {
      const outer = x < 7 || y < 7 || x >= size - 7 || y >= size - 7;
      const inner = x > 1 && x < 5 && y > 1 && y < 5;
      return outer || inner;
    }

    const code = hashString(`${value}:${x}:${y}`);
    return code % 5 < 2;
  };

  return (
    <svg viewBox={`0 0 ${size * cell} ${size * cell}`} role="img" aria-label="Unique ticket QR code" style={{ width: '100%', height: 'auto', display: 'block', background: '#fff', borderRadius: 16 }}>
      <rect width={size * cell} height={size * cell} fill="#fff" />
      {Array.from({ length: size }).flatMap((_, y) =>
        Array.from({ length: size }).map((__, x) =>
          isDark(x, y) ? <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} rx={1.4} fill="#081323" /> : null,
        ),
      )}
    </svg>
  );
}

function SiteHeader({ navigateTo }: { navigateTo: (path: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = [
    ['About', '/about'],
    ['Programme', '/programme'],
    ['Speakers', '/#speakers'],
    ['Battlefield', '/battlefield'],
    ['Exhibit', '/#exhibit'],
    ['Sponsor', '/sponsor'],
    ['Tickets', '/tickets'],
  ] as const;

  return (
    <>
      <div className="announcement"><span>12–14 NOVEMBER 2026</span><span className="announcement-dot" /> KANO, NIGERIA <button onClick={() => navigateTo('/tickets')}>Secure your spot <ArrowUpRight size={14} /></button></div>
      <header className="nav-wrap">
        <nav className="nav container">
          <button className="logo-button" onClick={() => navigateTo('/')} aria-label="AgriTech Fest home"><Mark /></button>
          <div className={`nav-links ${menuOpen ? 'is-open' : ''}`}>
            {navItems.map(([label, path]) => <button key={label} onClick={() => { navigateTo(path); setMenuOpen(false); }}>{label}</button>)}
          </div>
          <div className="nav-actions"><button className="text-link sponsor-link" onClick={() => navigateTo('/sponsor')}>Become a sponsor</button><button className="ticket-button" onClick={() => navigateTo('/tickets')}>Get ticket <ArrowUpRight size={16} /></button></div>
          <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X /> : <Menu />}</button>
        </nav>
      </header>
    </>
  );
}

function SiteFooter({ navigateTo }: { navigateTo: (path: string) => void }) {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand"><Mark light /><p>Where Africa’s agricultural<br />future meets.</p><span>© 2026 e360 Africa — Efficience 360 Technologies Ltd.</span></div>
        <div className="footer-col"><b>Explore</b><button onClick={() => navigateTo('/about')}>About</button><button onClick={() => navigateTo('/programme')}>Programme</button><button onClick={() => navigateTo('/battlefield')}>Battlefield</button><button onClick={() => navigateTo('/#speakers')}>Speakers</button></div>
        <div className="footer-col"><b>Get involved</b><button onClick={() => navigateTo('/tickets')}>Tickets</button><button onClick={() => navigateTo('/sponsor')}>Sponsor</button><button onClick={() => navigateTo('/#exhibit')}>Exhibit</button><button>Media pass</button></div>
        <div className="footer-col"><b>Connect</b><button>Newsletter</button><button>Instagram</button><button>LinkedIn</button><button>X / Twitter</button></div>
      </div>
      <div className="container footer-bottom"><span>Privacy · Terms</span><span>Made for the people building tomorrow.</span><button onClick={() => navigateTo('/')}><CircleArrowUp size={18} /> Back to top</button></div>
    </footer>
  );
}

function PageShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const navigateTo = (path: string) => navigate(path);

  return (
    <div className="site-shell">
      <SiteHeader navigateTo={navigateTo} />
      <main className="container" style={{ padding: '42px 0 96px' }}>
        <section className="section" style={{ paddingTop: 0 }}>
          <p className="eyebrow"><span /> {subtitle}</p>
          <h1 style={{ marginTop: 18, fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(52px, 8vw, 92px)', lineHeight: 0.94, letterSpacing: '-0.05em', marginBottom: 18 }}>{title}</h1>
        </section>
        {children}
      </main>
      <SiteFooter navigateTo={navigateTo} />
    </div>
  );
}

function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [day, setDay] = useState(0);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  const scrollTo = (id: string) => {
    if (routeMap[id]) {
      navigate(routeMap[id]);
      setMenuOpen(false);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <div className="site-shell">
      <div className="announcement"><span>12–14 NOVEMBER 2026</span><span className="announcement-dot" /> KANO, NIGERIA <button onClick={() => navigate('/tickets')}>Secure your spot <ArrowUpRight size={14} /></button></div>
      <header className="nav-wrap">
        <nav className="nav container">
          <button className="logo-button" onClick={() => scrollTo('top')} aria-label="AgriTech Fest home"><Mark /></button>
          <div className={`nav-links ${menuOpen ? 'is-open' : ''}`}>
            {navItems.map((item) => <button key={item} onClick={() => scrollTo(item.toLowerCase().replace(' ', '-'))}>{item}</button>)}
            <button className="mobile-sponsor" onClick={() => scrollTo('sponsor')}>Become a sponsor</button>
          </div>
          <div className="nav-actions"><button className="text-link sponsor-link" onClick={() => scrollTo('sponsor')}>Become a sponsor</button><button className="ticket-button" onClick={() => scrollTo('tickets')}>Get ticket <ArrowUpRight size={16} /></button></div>
          <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X /> : <Menu />}</button>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-image" style={{ backgroundImage: `url(${heroImage})` }} />
          <div className="hero-overlay" />
          <div className="hero-grid" />
          <div className="container hero-content">
            <div className="hero-copy"><p className="eyebrow light-eyebrow"><span /> KANO · NIGERIA · 12–14 NOVEMBER 2026</p><h1>Where Africa’s agricultural <em>future meets.</em></h1><p className="hero-description">The conference bringing Africa’s agritech ecosystem together to connect, collaborate, exchange ideas and celebrate the technologies and people transforming agriculture across the continent.</p><div className="hero-buttons"><button className="button button-lime" onClick={() => scrollTo('tickets')}>Secure your spot <ArrowUpRight size={17} /></button><button className="button button-outline" onClick={() => scrollTo('sponsor')}>Become a sponsor <ArrowUpRight size={17} /></button></div></div>
            <div className="hero-footer"><span>3 days</span><i /> <span>3 experiences</span><i /> <span>one agricultural future</span><div className="hero-scroll"><CircleArrowUp size={18} /> scroll to explore</div></div>
          </div>
        </section>

        <section className="partner-strip"><div className="container partner-inner"><div className="headline-partner"><span>Headline partner</span><strong>STERLING<span> BANK</span></strong></div><div className="partner-divider" /><div className="supported"><span>Supported by</span><div className="logo-marquee">{logos.concat(logos).map((logo, i) => <b key={`${logo}-${i}`}>{logo}</b>)}</div></div></div></section>

        <section className="numbers container"><p className="eyebrow"><span /> Built for momentum</p><div className="numbers-grid">{[['03', 'days'], ['03', 'venues'], ['500+', 'daily participants'], ['10+', 'speakers'], ['20+', 'exhibitors'], ['05', 'battlefield finalists']].map(([number, label]) => <div className="number-item" key={label}><strong>{number}</strong><span>{label}</span></div>)}</div></section>

        <section className="about section container" id="about"><div className="section-kicker"><span>01</span><span>the big idea</span></div><div className="about-grid"><div><h2>Agriculture is changing.<br /><em>Africa is building<br />what comes next.</em></h2></div><div className="about-copy"><p>AgriTech Fest connects the people growing our food with the innovators transforming how it is produced, financed, processed, distributed and consumed.</p><p>For three days, farmers, founders, students, researchers, investors, policymakers, development organisations and technology companies come together to explore practical solutions capable of moving African agriculture forward.</p><button className="arrow-link" onClick={() => scrollTo('promise')}>Discover AgriTech Fest <MoveRight size={18} /></button></div></div></section>

        <section className="promise section" id="promise"><div className="container"><div className="promise-heading"><div><p className="eyebrow"><span /> The promise</p><h2>Come for the ideas.<br /><em>Leave with momentum.</em></h2></div><p>One place to meet the people, technologies and opportunities moving African agriculture forward.</p></div><div className="promise-grid">{promiseItems.map(([title, subtitle, text], i) => <article className="promise-card" key={title}><span className="card-number">0{i + 1}</span><span className="promise-title">{title}</span><h3>{subtitle}</h3><p>{text}</p><ArrowUpRight className="card-arrow" size={20} /></article>)}</div></div></section>

        <section className="days section container" id="programme"><div className="section-heading-row"><div><p className="eyebrow"><span /> Three days. Three experiences.</p><h2>A festival with a <em>point of view.</em></h2></div><button className="arrow-link desktop-only" onClick={() => navigate('/programme')}>Explore full programme <MoveRight size={18} /></button></div><div className="days-grid">{days.map((item, i) => <article className={`day-card day-${item.color}`} key={item.number}><div className="day-top"><span>Day {item.number}</span><Sprout size={21} /></div><h3>{item.title}</h3><strong>{item.label}</strong><p>{item.text}</p><div className="day-place"><CalendarDays size={15} /> {item.place}</div><button className="day-link" onClick={() => navigate('/programme')}>View day {i + 1} <ChevronRight size={17} /></button></article>)}</div></section>

        <section className="battlefield" id="battlefield"><div className="battlefield-shape shape-one" /><div className="battlefield-shape shape-two" /><div className="container battlefield-inner"><div className="battlefield-top"><p className="eyebrow light-eyebrow"><span /> The innovation arena</p><Trophy size={44} /></div><h2>AgriTech<br /><em>Battlefield</em></h2><p className="battlefield-tag">Build it. Defend it. Scale it.</p><p className="battlefield-copy">Africa’s agricultural challenges need more than ideas. AgriTech Battlefield discovers and accelerates young innovators building practical solutions for the future of agriculture.</p><div className="funnel">{[['30+', 'applications'], ['20', 'shortlisted'], ['10', 'innovators'], ['05', 'finalists'], ['01', 'champion']].map(([n, label], i) => <div className="funnel-step" key={label}><strong>{n}</strong><span>{label}</span>{i < 4 && <ChevronRight className="funnel-arrow" />}</div>)}</div><div className="hero-buttons"><button className="button button-lime" onClick={() => navigate('/battlefield#apply')}>Enter the battlefield <ArrowUpRight size={17} /></button><button className="button button-outline" onClick={() => navigate('/battlefield')}>Explore competition <ArrowUpRight size={17} /></button></div></div></section>

        <section className="programme section container"><div className="section-heading-row"><div><p className="eyebrow"><span /> Event programme</p><h2>Three days. <em>Three experiences.</em></h2></div><button className="arrow-link desktop-only" onClick={() => navigate('/programme')}>Explore full programme <MoveRight size={18} /></button></div><div className="days-grid" style={{ marginTop: 26 }}>{programmeDays.map((item) => <article className="day-card" key={item.tab}><div className="day-top"><span>{item.tab}</span><Sprout size={21} /></div><h3>{item.tab}</h3><strong>{item.intro}</strong><p>Open the full programme page to see every session, panel, training block and activity.</p><button className="day-link" onClick={() => navigate('/programme')}>View full schedule <ChevronRight size={17} /></button></article>)}</div></section>

        <section className="exhibit section" id="exhibit"><div className="container exhibit-card"><div className="exhibit-image" style={{ backgroundImage: `url(${farmerImage})` }}><div className="image-tag"><Sprout size={16} /> In the field</div></div><div className="exhibit-copy"><p className="eyebrow"><span /> Exhibition</p><h2>Don’t just tell us what you’re building.<br /><em>Show us.</em></h2><p>Put your technology, products and solutions directly in front of farmers, founders, students, institutions, investors and policymakers.</p><div className="category-list">{['AgriTech', 'Machinery', 'Seeds', 'Inputs', 'Processing', 'Drones', 'Finance', 'Software', 'Research'].map(item => <span key={item}>{item}</span>)}</div><button className="button button-dark">Enquire to exhibit <ArrowUpRight size={17} /></button></div></div></section>

        <section className="speakers section container" id="speakers"><div className="section-heading-row"><div><p className="eyebrow"><span /> People to watch</p><h2>Meet the people shaping <em>what comes next.</em></h2></div><button className="arrow-link desktop-only">View all speakers <MoveRight size={18} /></button></div><div className="speaker-grid"><article className="speaker-card featured"><div className="speaker-image" style={{ backgroundImage: `url(${eventImage})` }} /><div className="speaker-meta"><span>Opening keynote</span><h3>Africa’s next agricultural chapter</h3><p>Voices from across the ecosystem</p></div></article><article className="speaker-card speaker-text"><Sparkles size={28} /><h3>Conversations for people who are building the future.</h3><p>Keynotes, founders, researchers, farmers, policymakers and investors in one room.</p><button className="arrow-link">Meet the speakers <MoveRight size={18} /></button></article></div></section>

        <section className="sponsor section" id="sponsor"><div className="container sponsor-grid"><div><p className="eyebrow light-eyebrow"><span /> Partnerships</p><h2>Put your brand where agriculture meets <em>innovation.</em></h2><button className="button button-lime" onClick={() => navigate('/sponsor')}>Become a sponsor <ArrowUpRight size={17} /></button></div><div className="benefit-list">{[['NETWORK', 'Meet the ecosystem.'], ['GENERATE LEADS', 'Meet tomorrow’s customers and partners.'], ['INNOVATE', 'Get closer to what’s next.'], ['GAIN EXPOSURE', 'Be visible to the people who matter.']].map(([title, text], i) => <div className="benefit" key={title}><span>0{i + 1}</span><div><strong>{title}</strong><p>{text}</p></div><ArrowUpRight size={18} /></div>)}</div></div></section>

        <section className="tickets section container" id="tickets"><div className="section-heading-row"><div><p className="eyebrow"><span /> Your pass to what’s next</p><h2>Choose your <em>experience.</em></h2></div><p className="heading-note">Three ways to be part of Africa’s agricultural technology gathering.</p></div><div className="ticket-grid">{[['Student pass', 'Free', 'For verified students.', 'lime'], ['Regular pass', 'Price to be determined', 'Three days of ideas, technology and opportunity.', 'white'], ['Corporate pass', '₦30,000', 'Priority access for the people building at scale.', 'gold']].map(([title, price, note, color]) => <article className={`ticket-card ticket-${color}`} key={title}><span className="ticket-label">{title}</span><strong>{price}</strong><p>{note}</p><ul><li>General conference access</li><li>Exhibition area</li><li>Networking areas</li><li>eCertificate of attendance</li></ul><button className="ticket-apply">Get {title} <ArrowUpRight size={16} /></button></article>)}</div></section>

        <section className="newsletter"><div className="container newsletter-inner"><div><p className="eyebrow"><span /> Keep in the loop</p><h2>Stay close to <em>what’s next.</em></h2></div><form onSubmit={(e) => e.preventDefault()}><input type="email" placeholder="Your email address" aria-label="Your email address" /><button type="submit">Stay updated <ArrowUpRight size={17} /></button></form></div></section>

        <section className="faq section container"><div><p className="eyebrow"><span /> Good to know</p><h2>Frequently<br /><em>asked.</em></h2><button className="arrow-link">Contact the team <MoveRight size={18} /></button></div><div className="faq-list">{['What is AgriTech Fest?', 'When is AgriTech Fest 2026?', 'Who can attend?', 'How can my company become a sponsor?', 'Is attendance virtual or in-person?'].map((question, i) => <div className={`faq-item ${faqOpen === i ? 'open' : ''}`} key={question}><button onClick={() => setFaqOpen(faqOpen === i ? null : i)}><span>0{i + 1}</span><strong>{question}</strong><ChevronDown size={18} /></button>{faqOpen === i && <p>AgriTech Fest brings together ambitious innovators, founders, investors, farmers, operators, researchers, policymakers, students and technology enthusiasts to connect, collaborate and celebrate innovation shaping agriculture across Africa.</p>}</div>)}</div></section>
      </main>

      <footer className="footer"><div className="container footer-grid"><div className="footer-brand"><Mark light /><p>Where Africa’s agricultural<br />future meets.</p><span>© 2026 e360 Africa — Efficience 360 Technologies Ltd.</span></div><div className="footer-col"><b>Explore</b><button onClick={() => scrollTo('about')}>About</button><button onClick={() => scrollTo('programme')}>Programme</button><button onClick={() => scrollTo('speakers')}>Speakers</button><button onClick={() => scrollTo('battlefield')}>Battlefield</button></div><div className="footer-col"><b>Get involved</b><button onClick={() => scrollTo('tickets')}>Tickets</button><button onClick={() => scrollTo('sponsor')}>Sponsor</button><button onClick={() => scrollTo('exhibit')}>Exhibit</button><button>Media pass</button></div><div className="footer-col"><b>Connect</b><button>Newsletter</button><button>Instagram</button><button>LinkedIn</button><button>X / Twitter</button></div></div><div className="container footer-bottom"><span>Privacy · Terms</span><span>Made for the people building tomorrow.</span><button onClick={() => scrollTo('top')}><CircleArrowUp size={18} /> Back to top</button></div></footer>
    </div>
  );
}

function AboutPage() {
  const navigateTo = (path: string) => navigate(path);

  return (
    <PageShell title="About AgriTech Fest" subtitle="The big idea">
      <div className="about-grid">
        <div>
          <h2>Africa is building what comes next.</h2>
          <p className="heading-note" style={{ marginTop: 18 }}>AgriTech Fest connects farmers, founders, researchers, investors, policymakers and students around practical ideas that can move agriculture forward.</p>
        </div>
        <div className="about-copy">
          <p>It is designed as a working event, not just a conference: a place to discover useful technology, learn from people doing the work and build relationships that can lead to pilots, partnerships and investment.</p>
          <p>Kano gives the festival access to a dense agricultural ecosystem, strong institutions and the kind of energy that makes innovation feel grounded in reality.</p>
          <button className="arrow-link" onClick={() => navigateTo('/programme')}>See the full programme <MoveRight size={18} /></button>
        </div>
      </div>

      <section className="numbers" style={{ paddingTop: 28 }}>
        <div className="numbers-grid">
          {[['03', 'days'], ['03', 'experiences'], ['500+', 'participants'], ['20+', 'exhibitors'], ['10+', 'speakers'], ['05', 'battlefield finalists']].map(([number, label]) => <div className="number-item" key={label}><strong>{number}</strong><span>{label}</span></div>)}
        </div>
      </section>

      <section className="promise section" style={{ paddingBottom: 0 }}>
        <div className="promise-grid">
          {promiseItems.map(([title, subtitle, text]) => <article className="promise-card" key={title}><span className="card-number">{title}</span><h3>{subtitle}</h3><p>{text}</p></article>)}
        </div>
      </section>
    </PageShell>
  );
}

function ProgrammePage() {
  return (
    <PageShell title="Full Programme" subtitle="Event programme">
      <section className="section" style={{ paddingTop: 0 }}>
        <p className="heading-note" style={{ maxWidth: 860 }}>This is the full three-day schedule for AgriTech Fest 2026. Each day has its own focus, venue and audience, with a mix of keynotes, panels, training, exhibition time and fun engagement moments.</p>
      </section>

      <div className="days-grid" style={{ gridTemplateColumns: '1fr', gap: 24 }}>
        {programmeDays.map((day) => (
          <article key={day.tab} className="day-card" style={{ minHeight: 'unset' }}>
            <div className="day-top"><span>{day.tab}</span><Sprout size={21} /></div>
            <h3 style={{ marginTop: 28 }}>{day.intro.split(' Focus: ')[0]}</h3>
            <strong style={{ display: 'block', marginBottom: 18 }}>{day.intro.split(' Focus: ')[1] ?? day.intro}</strong>
            <div className="programme-list">
              {day.sessions.map(([time, title, type]) => <div className="programme-row" key={`${day.tab}-${time}-${title}`}><time>{time}</time><strong>{title}</strong><span>{type}</span><ChevronRight size={17} /></div>)}
            </div>
          </article>
        ))}
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

        <form className="ticket-card" style={{ gap: 14 }} onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
          <span className="ticket-label">Sponsor enquiry</span>
          <input required placeholder="Organisation name" />
          <input required placeholder="Contact name" />
          <input required type="email" placeholder="Email address" />
          <input placeholder="Phone number" />
          <select defaultValue="">
            <option value="" disabled>Sponsorship interest</option>
            <option>Battlefield</option>
            <option>Programme</option>
            <option>Tickets</option>
            <option>Exhibition</option>
          </select>
          <textarea rows={5} placeholder="Tell us what you want to support" />
          <button className="ticket-apply" type="submit">Submit sponsor enquiry <ArrowUpRight size={16} /></button>
          {sent && <p className="heading-note">Thanks. The team will reach out with sponsorship options.</p>}
        </form>
      </div>
    </PageShell>
  );
}

function TicketsPage() {
  const [ticket, setTicket] = useState<{ id: string; name: string; email: string; type: string } | null>(null);

  return (
    <PageShell title="Get Your Ticket" subtitle="Ticketing">
      <div className="ticket-grid" style={{ gridTemplateColumns: '1fr' }}>
        <form className="ticket-card" id="purchase" style={{ gap: 14 }} onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          const name = String(form.get('name') || 'Guest');
          const email = String(form.get('email') || '');
          const type = String(form.get('type') || 'Regular pass');
          setTicket({ id: `ATF-${Math.random().toString(36).slice(2, 4).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`, name, email, type });
        }}>
          <span className="ticket-label">Purchase ticket</span>
          <input name="name" required placeholder="Full name" />
          <input name="email" required type="email" placeholder="Email address" />
          <input name="phone" placeholder="Phone number" />
          <select name="type" defaultValue="Regular pass">
            <option>Student pass</option>
            <option>Regular pass</option>
            <option>Corporate pass</option>
          </select>
          <textarea rows={5} placeholder="Any access notes or accessibility needs" />
          <button className="ticket-apply" type="submit">Secure my ticket <ArrowUpRight size={16} /></button>
          <p className="heading-note">On completion, a unique QR pass is generated for event-day check-in.</p>
        </form>

        {ticket && (
          <article className="ticket-card" style={{ gap: 14, marginTop: 24 }}>
            <span className="ticket-label">Your pass</span>
            <strong>{ticket.id}</strong>
            <p>{ticket.name} · {ticket.type}</p>
            <TicketQr value={ticket.id} />
            <p className="heading-note">{ticket.email}</p>
            <p className="heading-note">The QR code can be used at event check-in.</p>
          </article>
        )}
      </div>
    </PageShell>
  );
}

function BattlefieldPage() {
  const [submitted, setSubmitted] = useState(false);

  const categories = ['Precision Agriculture & Smart Farming', 'Mechanisation & Farm Tools', 'Climate-Smart Agriculture', 'Post-Harvest & Food Processing', 'Agricultural Finance & Market Access', 'Livestock & Animal Agriculture', 'Agricultural Biotechnology & Inputs', 'Food Systems & Circular Agriculture'];

  return (
    <PageShell title="AgriTech Battlefield" subtitle="Innovation pitch arena">
      <section className="battlefield" id="apply" style={{ marginTop: 0, borderRadius: 24 }}>
        <div className="container battlefield-inner">
          <p className="battlefield-tag">Build It. Defend It. Scale It.</p>
          <p className="battlefield-copy">The flagship student innovation competition of Kano Agri-Tech Fest 2026. This is where young innovators prove that their ideas can survive the real world.</p>
          <div className="funnel">
            {[['30+', 'applications'], ['20', 'shortlisted'], ['10', 'innovators'], ['05', 'finalists'], ['01', 'champion']].map(([n, label], i) => <div className="funnel-step" key={label}><strong>{n}</strong><span>{label}</span>{i < 4 && <ChevronRight className="funnel-arrow" />}</div>)}
          </div>
          <button className="button button-lime" onClick={() => document.getElementById('battleform')?.scrollIntoView({ behavior: 'smooth' })}>Enter the battlefield <ArrowUpRight size={17} /></button>
        </div>
      </section>

      <section className="section">
        <div className="about-grid">
          <div>
            <h2>The arena is built for real solutions.</h2>
          </div>
          <div className="about-copy">
            <p>Participants must show a real agricultural problem, a clear user, technical feasibility, African context awareness and potential for measurable impact.</p>
            <p>The programme moves innovators from application to screening, mentoring, technical interrogation, preliminary pitching and a grand finale before investors and policymakers.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <p className="eyebrow"><span /> Innovation categories</p>
        <div className="category-list" style={{ marginTop: 18 }}>
          {categories.map((item) => <span key={item}>{item}</span>)}
        </div>
      </section>

      <section className="section">
        <p className="eyebrow"><span /> Battlefield application</p>
        <form id="battleform" className="ticket-card" style={{ gap: 14, maxWidth: 780 }} onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
          <input required placeholder="Team / applicant name" />
          <input required placeholder="Institution" />
          <input required type="email" placeholder="Email address" />
          <input placeholder="Phone number" />
          <textarea rows={5} placeholder="Describe the problem, solution and stage of the innovation" />
          <button className="ticket-apply" type="submit">Submit Battlefield application <ArrowUpRight size={16} /></button>
          {submitted && <p className="heading-note">Application received. The team will contact you with screening details.</p>}
        </form>
      </section>
    </PageShell>
  );
}

function App() {
  const [location, setLocation] = useState({ pathname: window.location.pathname, hash: window.location.hash });

  useEffect(() => {
    const onPopState = () => setLocation({ pathname: window.location.pathname, hash: window.location.hash });
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const id = location.hash.replace('#', '');
    if (id) {
      window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }));
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname, location.hash]);

  if (location.pathname === '/programme') return <ProgrammePage />;
  if (location.pathname === '/about') return <AboutPage />;
  if (location.pathname === '/sponsor') return <SponsorPage />;
  if (location.pathname === '/tickets') return <TicketsPage />;
  if (location.pathname === '/battlefield') return <BattlefieldPage />;
  return <HomePage />;
}

export default App;
