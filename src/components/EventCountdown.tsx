import { useEffect, useState } from 'react';
import './event-countdown.css';

const EVENT_START = new Date('2026-11-12T09:00:00+01:00').getTime();

function remainingTime() {
  const distance = Math.max(0, EVENT_START - Date.now());
  return {
    distance,
    days: Math.floor(distance / 86_400_000),
    hours: Math.floor((distance / 3_600_000) % 24),
    minutes: Math.floor((distance / 60_000) % 60),
    seconds: Math.floor((distance / 1_000) % 60),
  };
}

export default function EventCountdown() {
  const [time, setTime] = useState(remainingTime);

  useEffect(() => {
    const timer = window.setInterval(() => setTime(remainingTime()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (time.distance === 0) {
    return <div className="event-countdown-live"><i aria-hidden="true" /> AgriTech Fest is live</div>;
  }

  const units = [
    [time.days, 'Days'],
    [time.hours, 'Hours'],
    [time.minutes, 'Minutes'],
    [time.seconds, 'Seconds'],
  ] as const;

  return (
    <div className="event-countdown" role="timer" aria-label={`${time.days} days, ${time.hours} hours, ${time.minutes} minutes and ${time.seconds} seconds until AgriTech Fest 2026`}>
      <div className="event-countdown-top"><span>Event starts in</span><i aria-hidden="true" /></div>
      <div className="event-countdown-units">
        {units.map(([value, label], index) => (
          <div className="event-countdown-unit" key={label}>
            <strong>{String(value).padStart(2, '0')}</strong>
            <span>{label}</span>
            {index < units.length - 1 && <b aria-hidden="true">:</b>}
          </div>
        ))}
      </div>
    </div>
  );
}
