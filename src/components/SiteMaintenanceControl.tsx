import { useEffect, useState } from 'react';
import { getSiteLive, setSiteLive } from '../lib/maintenance';

export default function SiteMaintenanceControl() {
  const [live, setLive] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function load() {
    setError('');
    try { setLive(await getSiteLive()); }
    catch { setError('Could not load site status. Check your connection and ensure the site maintenance database migration has been applied.'); }
  }
  useEffect(() => { void load(); }, []);
  async function toggle() {
    if (live === null || busy) return;
    setBusy(true); setError('');
    try { await setSiteLive(!live); setLive(!live); }
    catch { setError('Could not save site status. Check your connection and Site settings permission, then try again.'); }
    finally { setBusy(false); }
  }
  return <article className="admin-card publish-card">
    <header><div><span>WEBSITE STATUS</span><h2>Site Maintenance</h2></div><i className={live ? 'live' : ''} /></header>
    {import.meta.env.DEV && <p>Local preview bypasses maintenance automatically. This switch still changes the hosted site. Previewing locally does not require changing it.</p>}
    <p aria-live="polite">{live === null ? 'Loading saved site status…' : live ? 'Maintenance is OFF. Visitors can access the website.' : 'Maintenance is ON. Visitors see the branded maintenance page. Admin sign-in remains available.'}</p>
    <button type="button" role="switch" aria-label="Site Maintenance" aria-checked={live === false} disabled={live === null || busy} onClick={() => void toggle()}>{busy ? 'Saving…' : live === null ? 'Checking status…' : live ? 'Turn maintenance ON' : 'Turn maintenance OFF'}</button>
    {error && <div role="alert"><p>{error}</p>{live === null && <button type="button" onClick={() => void load()}>Retry</button>}</div>}
    <p><a href="/maintenance" target="_blank" rel="noreferrer">Preview maintenance page ↗</a></p>
  </article>;
}
