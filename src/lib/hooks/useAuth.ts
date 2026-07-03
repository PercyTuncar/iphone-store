'use client';

/**
 * useAuth — convenience re-export of the AuthContext value.
 * Keeps component imports clean: `import { useAuth } from '@/lib/hooks/useAuth'`
 * instead of importing directly from the context file.
 */
export { useAuth } from '@/context/AuthContext';
