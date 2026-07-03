'use client';

/**
 * useAutoSave — auto-saves form data as a Firestore draft every N seconds.
 * Used by the admin product editor and blog editor.
 *
 * @param saveFn  — async function that persists the data (receives the current value)
 * @param value   — the current form value to watch
 * @param intervalMs — save interval in ms (default: 30 000 = 30 seconds)
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useAutoSave<T>(
  saveFn: (value: T) => Promise<void>,
  value: T,
  intervalMs = 30_000
) {
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const valueRef = useRef(value);

  // Keep ref current without triggering re-subscribe
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const save = useCallback(async () => {
    setStatus('saving');
    try {
      await saveFn(valueRef.current);
      setLastSavedAt(new Date());
      setStatus('saved');
    } catch (err) {
      console.error('[useAutoSave] save failed:', err);
      setStatus('error');
    }
  }, [saveFn]);

  // Periodic auto-save
  useEffect(() => {
    const timer = setInterval(save, intervalMs);
    return () => clearInterval(timer);
  }, [save, intervalMs]);

  return { status, lastSavedAt, saveNow: save };
}
