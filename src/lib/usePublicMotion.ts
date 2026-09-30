import { useEffect } from 'react';

export default function usePublicMotion(path: string, live: boolean | null) {
  useEffect(() => {
    if (path.startsWith('/admin') || !live) return;
    const preference = window.matchMedia('(prefers-reduced-motion: no-preference)');
    let observer: IntersectionObserver | undefined;
    let nodes: Element[] = [];
    const setup = () => {
      observer?.disconnect();
      nodes.forEach(node => node.classList.remove('motion-ready', 'motion-visible'));
      if (!preference.matches || !('IntersectionObserver' in window)) return;
      nodes = Array.from(document.querySelectorAll('.site-shell main section > .container, .site-shell main > section.container, .programme-day-panel, .speaker-reveal-page-hero, .newsletter-page-hero'));
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('motion-visible');
            observer?.unobserve(entry.target);
          }
        });
      }, { threshold: 0, rootMargin: '0px 0px -20px 0px' });
      nodes.forEach(node => {
        if (node.getBoundingClientRect().top < window.innerHeight) return;
        node.classList.add('motion-ready');
        observer?.observe(node);
      });
    };
    setup();
    preference.addEventListener('change', setup);
    return () => {
      observer?.disconnect();
      preference.removeEventListener('change', setup);
      nodes.forEach(node => node.classList.remove('motion-ready', 'motion-visible'));
    };
  }, [path, live]);
}
