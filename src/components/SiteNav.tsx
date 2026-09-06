import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import './site-nav.css';
import './site-nav-split.css';

const links = [
  ['About', '/about'],
  ['Programme', '/programme'],
  ['Speakers', '/speakers'],
  ['Battlefield', '/battlefield'],
  ['Exhibit', '/exhibit'],
  ['Partners', '/sponsors-partners'],
  ['Get involved', '/get-involved'],
] as const;

type SiteNavProps = {
  onNavigate: (path: string) => void;
  logo: React.ReactNode;
};

export default function SiteNav({ onNavigate, logo }: SiteNavProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const currentPath = window.location.pathname;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    const onPointerDown = (event: PointerEvent) => {
      if (open && rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  const go = (path: string) => {
    setOpen(false);
    onNavigate(path);
  };

  return (
    <header ref={rootRef} className={`floating-header ${scrolled ? 'is-scrolled' : ''}`}>
      <nav className="floating-nav" aria-label="Primary navigation">
        <button className="floating-logo" onClick={() => go('/')} aria-label="AgriTech Fest home">
          {logo}
        </button>

        <div className="floating-links" aria-label="Main navigation">
          {links.map(([label, path]) => (
            <button
              key={path}
              className={currentPath === path ? 'is-active' : ''}
              aria-current={currentPath === path ? 'page' : undefined}
              onClick={() => go(path)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="floating-actions">
          <button className="floating-cta" onClick={() => go('/tickets')}>Get ticket</button>
          <button
            className="floating-menu-button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={open}
            aria-controls="mobile-primary-navigation"
          >
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        <div id="mobile-primary-navigation" className={`floating-mobile-menu ${open ? 'is-open' : ''}`} aria-hidden={!open}>
          <div className="mobile-menu-heading"><span>Explore AgriTech Fest</span><small>Kano · 12–14 November 2026</small></div>
          {links.map(([label, path]) => (
            <button key={path} className={currentPath === path ? 'is-active' : ''} onClick={() => go(path)}>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}
