'use client';

/**
 * Confetti — celebratory animation shown when a payment installment is approved.
 * Uses CSS animations only (no heavy canvas libraries).
 * Respects prefers-reduced-motion: no confetti if user has reduced motion on.
 */

import { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;       // horizontal start % (0–100)
  color: string;
  size: number;    // px
  delay: number;   // ms
  duration: number; // ms
  rotation: number; // initial rotate deg
}

const COLORS = ['#0071E3', '#34C759', '#FF9F0A', '#FF3B30', '#5AC8FA', '#AF52DE'];

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function generatePieces(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: randomBetween(5, 95),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: randomBetween(6, 12),
    delay: randomBetween(0, 600),
    duration: randomBetween(1800, 2800),
    rotation: randomBetween(0, 360),
  }));
}

interface ConfettiProps {
  /** When true the confetti bursts and auto-clears after ~3s */
  active: boolean;
  /** Number of particles (default 50) */
  count?: number;
}

export function Confetti({ active, count = 50 }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Respect reduced motion
    if (typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    if (active) {
      setPieces(generatePieces(count));
      setVisible(true);

      const timeout = setTimeout(() => {
        setVisible(false);
        setPieces([]);
      }, 3200);

      return () => clearTimeout(timeout);
    }
  }, [active, count]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
    >
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: '-12px',
            width: `${p.size}px`,
            height: `${p.size * 0.6}px`,
            background: p.color,
            borderRadius: '2px',
            transform: `rotate(${p.rotation}deg)`,
            animation: `confettiFall ${p.duration}ms ease-in ${p.delay}ms forwards`,
          }}
        />
      ))}
    </div>
  );
}
