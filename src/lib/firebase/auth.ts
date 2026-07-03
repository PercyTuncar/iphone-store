/**
 * Firebase Authentication helpers
 */

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
  type Unsubscribe,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './config';
import type { User, UserProfileUpdate } from '@/types/user';

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

export async function signInWithGoogle(useRedirect = false): Promise<void> {
  if (useRedirect) {
    await signInWithRedirect(auth, googleProvider);
  } else {
    await signInWithPopup(auth, googleProvider);
  }
}

/**
 * Sign in with Google AND create the HTTPOnly session cookie.
 */
export async function signInWithGoogleAndCreateSession(
  useRedirect = false
): Promise<void> {
  if (useRedirect) {
    await signInWithRedirect(auth, googleProvider);
    return;
  }
  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();
  await fetch('/api/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
}

/** Sign out and clear the session cookie */
export async function signOutUser(): Promise<void> {
  await signOut(auth);
  await fetch('/api/session', { method: 'DELETE' });
}

export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

export function subscribeToAuthState(
  callback: (user: FirebaseUser | null) => void
): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

/**
 * Creates or updates the Firestore user document on every login.
 *
 * First login  → creates the document with all fields initialized.
 * Return login → only updates lastLoginAt (preserves profile edits).
 */
export async function ensureUserDocument(
  firebaseUser: FirebaseUser
): Promise<User> {
  const userRef  = doc(db, 'users', firebaseUser.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    // ── Primera vez: registrar con todos los campos ──
    const newUser = {
      uid:             firebaseUser.uid,
      email:           firebaseUser.email          ?? '',
      displayName:     firebaseUser.displayName    ?? '',
      photoURL:        firebaseUser.photoURL        ?? '',
      role:            'customer' as const,
      // Perfil editable (vacío al inicio)
      firstName:       '',
      lastName:        '',
      dni:             '',
      whatsapp:        '',
      customPhotoURL:  '',
      profileCompleted: false,
      createdAt:       serverTimestamp(),
      lastLoginAt:     serverTimestamp(),
    };

    await setDoc(userRef, newUser);
    const created = await getDoc(userRef);
    return created.data() as User;
  } else {
    // ── Login siguiente: actualizar solo lastLoginAt ──
    await updateDoc(userRef, { lastLoginAt: serverTimestamp() });
    return snapshot.data() as User;
  }
}

/** Obtiene el documento de usuario de Firestore por UID */
export async function getUserDocument(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return snap.data() as User;
}

/**
 * Actualiza los campos de perfil editables del usuario en Firestore.
 * Marca profileCompleted = true si firstName + dni están rellenos.
 */
export async function updateUserProfile(
  uid: string,
  data: UserProfileUpdate
): Promise<void> {
  const userRef = doc(db, 'users', uid);

  const isCompleted =
    !!((data.firstName ?? '').trim()) &&
    !!((data.lastName  ?? '').trim());

  await updateDoc(userRef, {
    ...data,
    // displayName sincronizado: firstName + lastName
    displayName: [data.firstName, data.lastName].filter(Boolean).join(' ') || data.displayName,
    profileCompleted: isCompleted,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Promueve un usuario a admin.
 * Solo para uso desde scripts de servidor o la consola de Firebase.
 * (En producción se hace directamente en Firebase Console)
 */
export async function promoteToAdmin(uid: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { role: 'admin' });
}
