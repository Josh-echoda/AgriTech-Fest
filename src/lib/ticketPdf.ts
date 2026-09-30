import type { TicketPassData } from '../components/TicketPass';

export async function createTicketPdf(ticket: TicketPassData, attendance: { day: string; venue: string }, svg: SVGSVGElement) {
  const { jsPDF } = await import('jspdf');
  const qrUrl = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' }));
  const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not prepare your ticket artwork. Please retry.'));
    image.src = src;
  });
  try {
    const [qr, logo] = await Promise.all([loadImage(qrUrl), loadImage('/assets/images/LOGO_BRIGHT_.png')]);
    // The download deliberately uses the original portrait pass, independently
    // of the compact on-screen confirmation layout.
    const canvas = document.createElement('canvas');
    canvas.width = 1000; canvas.height = 1660;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Your browser could not generate the pass.');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 1000, 1660);
    ctx.save();
    ctx.beginPath(); ctx.roundRect(20, 20, 960, 1620, 48); ctx.clip();
    ctx.fillStyle = '#030706'; ctx.fillRect(20, 20, 960, 1620);
    const glow = ctx.createRadialGradient(80, 45, 0, 80, 45, 680);
    glow.addColorStop(0, '#283608'); glow.addColorStop(1, '#030706');
    ctx.fillStyle = glow; ctx.fillRect(20, 20, 960, 800);
    ctx.restore();
    // Original ticket notch and bright logo.
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(500, 14, 66, 0, Math.PI); ctx.fill();
    const logoScale = Math.min(150 / logo.width, 125 / logo.height);
    ctx.drawImage(logo, 92, 100, logo.width * logoScale, logo.height * logoScale);
    function text(value: string, x: number, y: number, size: number, color = '#ffffff', width = 816, weight = 400) {
      ctx!.fillStyle = color; ctx!.font = `${weight} ${size}px Arial`;
      const words = value.split(/\s+/); let line = ''; let baseline = y; let lines = 1;
      for (const word of words) {
        if (ctx!.measureText(line + word).width > width && line) {
          if (lines === 2) { line = line.trim() + '…'; break; }
          ctx!.fillText(line.trim(), x, baseline, width); baseline += size * 1.25; lines++; line = '';
        }
        line += word + ' ';
      }
      ctx!.fillText(line.trim(), x, baseline, width);
      return baseline;
    }
    const label = (value: string, x: number, y: number) => text(value, x, y, 20, '#9ba79c', 816, 700);
    label('EVENT NAME', 92, 280);
    text('AgriTech Fest 2026', 92, 352, 57, '#ffffff', 816, 700);
    label('EVENT VENUE', 92, 432);
    text(attendance.venue, 92, 493, 44, '#ffffff', 816, 600);
    label('VALID FOR', 92, 641); label('PASS TYPE', 552, 641);
    text(attendance.day, 92, 691, 31, '#ffffff', 410, 600);
    text(ticket.type, 552, 691, 31, '#ffffff', 350, 600);
    ctx.strokeStyle = '#425044'; ctx.lineWidth = 2; ctx.setLineDash([5, 7]);
    ctx.beginPath(); ctx.moveTo(92, 750); ctx.lineTo(908, 750); ctx.stroke(); ctx.setLineDash([]);
    label('ATTENDEE', 92, 802);
    const nameEnd = text(ticket.name, 92, 852, 36, '#ffffff', 816, 600);
    text(ticket.email, 92, nameEnd + 40, 25, '#aab3ad');
    ctx.fillStyle = '#1b211c'; ctx.beginPath(); ctx.roundRect(254, 980, 492, 492, 36); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(264, 990, 472, 472, 28); ctx.fill();
    ctx.drawImage(qr, 276, 1002, 448, 448);
    label('TICKET ID', 92, 1523);
    text(ticket.id, 92, 1562, 24, '#dce3dd', 400);
    text(ticket.test ? 'TEST ONLY — NOT VALID FOR ADMISSION' : 'READY FOR CHECK-IN', 92, 1603, 20, '#c9ed87', 816, 700);
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [150, 249] });
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 150, 249);
    return pdf.output('blob');
  } finally { URL.revokeObjectURL(qrUrl); }
}
