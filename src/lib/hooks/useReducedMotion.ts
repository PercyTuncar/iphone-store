'use client';

/**
 * useReducedMotion — returns true if the user has enabled
 * "Reduce Motion" in their OS accessibility settings.
 *
 * PRD §21.3: all animations > 100ms must be disabled when this is true.
 * Components use this hook to conditionally apply animation classes.
 */

import { useState, useEffect } from 'react';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}
