import { Timestamp } from 'firebase/firestore';

export type UserRole = 'customer' | 'admin';

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;

  // ── Datos de Google (auto-rellenados en el primer login) ──
  /** Nombre completo tal como Google lo devuelve — puede ser sobreescrito en el perfil */
  displayName: string;
  /** Foto de perfil de Google — puede ser sobreescrita en el perfil */
  photoURL: string;

  // ── Datos de perfil editables por el usuario ──
  /** Nombre(s) — editable */
  firstName: string;
  /** Apellido(s) — editable */
  lastName: string;
  /** DNI peruano (8 dígitos) */
  dni: string;
  /** Número de WhatsApp con código de país, ej: 51999888777 */
  whatsapp: string;
  /** URL de foto personalizada subida por el usuario (sobreescribe photoURL de Google) */
  customPhotoURL: string;
  /** Si el perfil ha sido completado (firstName + dni rellenos) */
  profileCompleted: boolean;
}

/** Shape returned by Firebase Auth (before Firestore lookup) */
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

/** Partial update payload for the profile form */
export type UserProfileUpdate = Partial<
  Pick<User, 'firstName' | 'lastName' | 'dni' | 'whatsapp' | 'customPhotoURL' | 'displayName'>
>;
