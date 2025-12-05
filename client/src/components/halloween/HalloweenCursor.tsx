import React, { useEffect, useState } from 'react';
import { useHalloween } from '../../contexts/HalloweenContext';

interface CursorTrail {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

export const HalloweenCursor: React.FC = () => {
  const { isHalloweenMode } = useHalloween();
  const [trails, setTrails] = useState<CursorTrail[]>([]);
  const [trailId, setTrailId] = useState(0);

  const halloweenEmojis = ['🎃', '👻', '🦇', '🕷️', '🍂', '⚡'];

  useEffect(() => {
    if (!isHalloweenMode) {
      setTrails([]);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const newTrail: CursorTrail = {
        id: trailId,
        x: e.clientX,
        y: e.clientY,
        emoji: halloweenEmojis[Math.floor(Math.random() * halloweenEmojis.length)]
      };

      setTrails(prev => [...prev.slice(-8), newTrail]);
      setTrailId(prev => prev + 1);
    };

    // Throttle mouse move events
    let throttleTimer: NodeJS.Timeout | null = null;
    const throttledMouseMove = (e: MouseEvent) => {
      if (throttleTimer) return;
      throttleTimer = setTimeout(() => {
        handleMouseMove(e);
        throttleTimer = null;
      }, 100);
    };

    document.addEventListener('mousemove', throttledMouseMove);

    return () => {
      document.removeEventListener('mousemove', throttledMouseMove);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [isHalloweenMode, trailId]);

  // Clean up old trails
  useEffect(() => {
    const cleanup = setInterval(() => {
      setTrails(prev => prev.slice(-5));
    }, 1000);

    return () => clearInterval(cleanup);
  }, []);

  if (!isHalloweenMode) return null;

  return (
    <div className="halloween-cursor-trails">
      {trails.map((trail, index) => (
        <div
          key={trail.id}
          className="fixed pointer-events-none z-50 text-lg animate-fade-in-out"
          style={{
            left: trail.x - 10,
            top: trail.y - 10,
            opacity: (index + 1) / trails.length * 0.7,
            animationDelay: `${index * 0.1}s`,
            animationDuration: '2s'
          }}
        >
          {trail.emoji}
        </div>
      ))}
    </div>
  );
};