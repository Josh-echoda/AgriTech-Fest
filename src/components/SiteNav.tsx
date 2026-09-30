import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import './site-nav.css';
import './site-nav-split.css';
const mobileLinks = [
  ['About', '/about'], ['Battlefield', '/battlefield'], ['Tickets', '/tickets'],
  ['Partners', '/sponsors-partners'], ['Speakers', '/speakers'], ['Exhibition', '/exhibit'],
  ['Programme', '/programme'], ['Get involved', '/get-involved'],
] as const;
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
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const resize = () => { if (window.innerWidth > 820) setOpen(false); };
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const controls = Array.from(rootRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? []).filter(button => button.getClientRects().length > 0);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener('resize', resize);
    document.addEventListener('keydown', trap);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('resize', resize);
      document.removeEventListener('keydown', trap);
    };
  }, [open]);
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
    <header ref={rootRef} className={`floating-header ${scrolled ? 'is-scrolled' : ''} ${open ? 'menu-expanded' : ''}`}>
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

          {mobileLinks.map(([label, path]) => (
            <button key={path} className={currentPath === path ? 'is-active' : ''} aria-current={currentPath === path ? 'page' : undefined} onClick={() => go(path)}>
              <span>{label}</span>
            </button>
          ))}
          <button className="mobile-register" onClick={() => go('/tickets')}>Register now</button>
        </div>
      </nav>
    </header>
  );
}
