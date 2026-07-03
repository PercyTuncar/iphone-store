'use client';

/**
 * useCountdown — calculates time remaining until a target date.
 * Updates every second. Used for installment due-date countdowns.
 */

import { useState, useEffect } from 'react';
import { msUntil } from '@/lib/utils/dates';

export interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  totalMs: number;
}

export function useCountdown(targetDate: Date | null): CountdownResult {
  const [remaining, setRemaining] = useState<number>(
    targetDate ? msUntil(targetDate) : 0
  );

  useEffect(() => {
    if (!targetDate) return;

    const update = () => {
      setRemaining(msUntil(targetDate));
    };

    update(); // immediate update
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!targetDate || remaining <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, totalMs: 0 };
  }

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, isExpired: false, totalMs: remaining };
}
