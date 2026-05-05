/**
 * CountdownTimer.jsx — Live countdown with SVG icon
 */
import React, { useState, useEffect } from 'react';
import { IconClock } from '../utils/icons';

export default function CountdownTimer({ endTime }) {
  const [remaining, setRemaining] = useState('');
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    const tick = () => {
      const diff = endTime - Date.now();
      if (diff <= 0) {
        setRemaining('00:00');
        setUrgent(true);
        return;
      }

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      if (h > 0) {
        setRemaining(`${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
      } else {
        setRemaining(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
      }

      setUrgent(diff < 60000);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <div className={`countdown-timer ${urgent ? 'urgent' : ''}`}>
      <IconClock size={13} />
      {remaining}
    </div>
  );
}
