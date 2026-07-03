'use client';

/**
 * /admin/make-admin — Herramienta para promover un usuario a administrador.
 * Solo accesible para administradores existentes.
 *
 * Flujo:
 * 1. Admin busca al usuario por email
 * 2. El sistema muestra los datos del usuario de Firestore
 * 3. Admin confirma la promoción
 * 4. Se actualiza role: "admin" en Firestore
 */

import { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { promoteToAdmin } from '@/lib/firebase/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/Toast';
import { AppImage } from '@/components/ui/AppImage';
import type { User } from '@/types/user';

export default function MakeAdminPage() {
  const [email,   setEmail]   = useState('');
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [promoted,  setPromoted]  = useState(false);

  // ── Buscar usuario por email ──────────────────────────────
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setUser(null);
    setPromoted(false);
    try {
      const q    = query(collection(db, 'users'), where('email', '==', email.trim()));
      const snap = await getDocs(q);
      if (snap.empty) {
        toast.error('No se encontró ningún usuario con ese email.');
      } else {
        setUser(snap.docs[0].data() as User);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al buscar el usuario.');
    } finally {
      setLoading(false);
    }
  };

  // ── Promover a admin ──────────────────────────────────────
  const handlePromote = async () => {
    if (!user) return;
    if (!window.confirm(
      `¿Estás seguro de que quieres dar acceso de ADMINISTRADOR a ${user.email}?\n\n` +
      `Esta persona podrá gestionar productos, pedidos y todos los datos del sistema.`
    )) return;

    setPromoting(true);
    try {
      await promoteToAdmin(user.uid);
      setPromoted(true);
      setUser(prev => prev ? { ...prev, role: 'admin' } : null);
      toast.success(`${user.email} ahora es administrador. ✓`);
    } catch (err) {
      console.error(err);
      toast.error('No se pudo promover al usuario. Intenta de nuevo.');
    } finally {
      setPromoting(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-section-title mb-1">Gestión de Administradores</h1>
        <p className="text-body text-text-secondary">
          Busca un usuario registrado por su email y otórgale permisos de administrador.
        </p>
      </div>

      {/* ── Alerta de seguridad ── */}
      <div className="bg-warning/5 border border-warning/25 rounded-[14px] p-4">
        <p className="text-[14px] text-warning font-semibold mb-1">⚠ Acción de alto impacto</p>
        <p className="text-[14px] text-text-secondary">
          Un administrador puede crear, editar y eliminar productos, aprobar pagos,
          gestionar pedidos y acceder a todos los datos de los clientes.
          Solo otorga este rol a personas de confianza.
        </p>
      </div>

      {/* ── Formulario de búsqueda ── */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <Input
          label="Email del usuario"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="usuario@gmail.com"
          type="email"
          className="flex-1"
          fullWidth={false}
        />
        <Button
          type="submit"
          variant="secondary"
          loading={loading}
          className="self-end"
        >
          Buscar
        </Button>
      </form>

      {/* ── Resultado de búsqueda ── */}
      {user && (
        <div className="card p-5 space-y-4 animate-fade-in">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {user.customPhotoURL || user.photoURL ? (
                <AppImage
                  src={user.customPhotoURL || user.photoURL}
                  alt={user.displayName || user.email}
                  width={56}
                  height={56}
                  preset="avatar"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center text-white text-[22px] font-bold">
                  {(user.displayName || user.email)[0].toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <p className="font-semibold text-[17px]">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.displayName || '—'}
                </p>
                <Badge variant={user.role === 'admin' ? 'accent' : 'neutral'}>
                  {user.role === 'admin' ? '🛡 Administrador' : 'Cliente'}
                </Badge>
              </div>
              <p className="text-[14px] text-text-secondary">{user.email}</p>
              {user.dni && (
                <p className="text-caption text-text-tertiary">DNI: {user.dni}</p>
              )}
              <p className="text-caption text-text-tertiary">
                Registrado:{' '}
                {user.createdAt
                  ? new Date(
                      (user.createdAt as { toDate(): Date }).toDate()
                    ).toLocaleDateString('es-PE')
                  : '—'}
              </p>
            </div>
          </div>

          {/* Acción */}
          {user.role === 'admin' ? (
            <div className="bg-success/5 border border-success/20 rounded-[10px] p-3">
              <p className="text-[14px] text-success font-medium">
                ✓ Este usuario ya es administrador.
              </p>
            </div>
          ) : promoted ? (
            <div className="bg-success/5 border border-success/20 rounded-[10px] p-3">
              <p className="text-[14px] text-success font-medium">
                ✓ Promovido exitosamente a administrador.
              </p>
            </div>
          ) : (
            <Button
              variant="primary"
              fullWidth
              loading={promoting}
              onClick={handlePromote}
            >
              Otorgar permisos de Administrador
            </Button>
          )}
        </div>
      )}

      {/* ── Instrucciones alternativas ── */}
      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-[15px]">Método alternativo: Firebase Console</h2>
        <ol className="text-[14px] text-text-secondary space-y-2 list-decimal list-inside">
          <li>Ir a <strong>console.firebase.google.com</strong></li>
          <li>Proyecto → Firestore Database → Colección <code className="bg-bg-secondary px-1 rounded">users</code></li>
          <li>Buscar el documento del usuario (ID = uid)</li>
          <li>Editar el campo <code className="bg-bg-secondary px-1 rounded">role</code> → cambiar a <code className="bg-bg-secondary px-1 rounded">&quot;admin&quot;</code></li>
          <li>Guardar. El cambio aplica en el próximo login del usuario.</li>
        </ol>
      </div>
    </div>
  );
}
