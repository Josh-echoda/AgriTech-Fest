import { useEffect, useState } from 'react';
import { getSiteLive } from './maintenance';

export function useSiteLive() {
  const [live, setLive] = useState(false);
  useEffect(() => {
    let active = true;
    let pending = false;
    async function refresh() {
      if (pending) return;
      pending = true;
      try { const value = await getSiteLive(); if (active) setLive(value); }
      catch { if (active) setLive(false); }
      finally { pending = false; }
    }
    void refresh();
    const interval = window.setInterval(() => void refresh(), 15000);
    window.addEventListener('focus', refresh);
    return () => { active = false; window.clearInterval(interval); window.removeEventListener('focus', refresh); };
  }, []);
  return live;
}
