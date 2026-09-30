import { useEffect, useRef, useState } from 'react';
import ExhibitEnquiry from './ExhibitEnquiry';
export default function EnquiryPopup() {
  const ref = useRef<HTMLDialogElement>(null);
  const [kind, setKind] = useState<'exhibitor' | 'enterprise' | null>(null);
  useEffect(() => {
    const open = (event: Event) => setKind((event as CustomEvent).detail === 'enterprise' ? 'enterprise' : 'exhibitor');
    window.addEventListener('open-enquiry', open);
    return () => window.removeEventListener('open-enquiry', open);
  }, []);
  useEffect(() => {
    if (!kind) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.showModal();
    return () => { document.body.style.overflow = previous; };
  }, [kind]);
  return <dialog className="enquiry-popup" ref={ref} aria-label={kind === 'enterprise' ? 'Enterprise enquiry' : 'Exhibition enquiry'} onClose={() => setKind(null)} onClick={event => { if (event.target === event.currentTarget) ref.current?.close(); }}>
    <div><button className="enquiry-close" type="button" onClick={() => ref.current?.close()} aria-label="Close enquiry">Close ×</button>
    {kind && <ExhibitEnquiry key={kind} enterprise={kind === 'enterprise'} />}</div>
  </dialog>;
}
