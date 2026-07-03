'use client';

/**
 * AuthContext — Global authentication provider.
 * Exposes: firebaseUser, appUser (con rol + perfil), loading, signIn, signOut.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { type User as FirebaseUser } from 'firebase/auth';
import {
  signInWithGoogleAndCreateSession,
  subscribeToAuthState,
  ensureUserDocument,
} from '@/lib/firebase/auth';
import type { User } from '@/types/user';

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  appUser: User | null;
  loading: boolean;
  /** URL efectiva de foto: customPhotoURL si existe, si no photoURL de Google */
  effectivePhotoURL: string | null;
  /** Nombre efectivo: firstName+lastName si están, si no displayName de Google */
  effectiveName: string;
  signIn: (useRedirect?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  /** Refresca el appUser desde Firestore (útil después de actualizar el perfil) */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [appUser,      setAppUser]      = useState<User | null>(null);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const userData = await ensureUserDocument(fbUser);
          setAppUser(userData);
        } catch (err) {
          console.error('[AuthContext] ensureUserDocument failed:', err);
          setAppUser(null);
        }
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = useCallback(async (useRedirect = false) => {
    await signInWithGoogleAndCreateSession(useRedirect);
  }, []);

  const signOut = useCallback(async () => {
    const { signOutUser } = await import('@/lib/firebase/auth');
    await signOutUser();
    setFirebaseUser(null);
    setAppUser(null);
  }, []);

  /** Recarga el documento del usuario desde Firestore */
  const refreshUser = useCallback(async () => {
    if (!firebaseUser) return;
    const { getUserDocument } = await import('@/lib/firebase/auth');
    const updated = await getUserDocument(firebaseUser.uid);
    if (updated) setAppUser(updated);
  }, [firebaseUser]);

  // Foto efectiva: primero customPhotoURL, luego photoURL de Google
  const effectivePhotoURL =
    appUser?.customPhotoURL || appUser?.photoURL || firebaseUser?.photoURL || null;

  // Nombre efectivo: firstName+lastName si completo, si no displayName
  const effectiveName =
    (appUser?.firstName && appUser?.lastName)
      ? `${appUser.firstName} ${appUser.lastName}`.trim()
      : appUser?.displayName || firebaseUser?.displayName || '';

  return (
    <AuthContext.Provider value={{
      firebaseUser,
      appUser,
      loading,
      effectivePhotoURL,
      effectiveName,
      signIn,
      signOut,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
