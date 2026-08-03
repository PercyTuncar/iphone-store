'use client';

/**
 * /dashboard/perfil — Página de perfil del usuario.
 * Permite editar: nombre, apellido, DNI, WhatsApp y foto de perfil.
 * Los datos se guardan en Firestore (users/{uid}).
 */

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, ArrowLeft, Save, CheckCircle, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/hooks/useAuth';
import { updateUserProfile } from '@/lib/firebase/auth';
import { uploadProductImage } from '@/lib/firebase/storage';
import Link from 'next/link';

export default function PerfilPage() {
  const router = useRouter();
  const {
    firebaseUser,
    appUser,
    loading: authLoading,
    effectivePhotoURL,
    effectiveName,
    refreshUser,
  } = useAuth();

  const fileRef = useRef<HTMLInputElement>(null);
  const [saving,        setSaving]        = useState(false);
  const [photoUploading,setPhotoUploading]= useState(false);
  const [saved,         setSaved]         = useState(false);

  const [form, setForm] = useState({
    firstName:      '',
    lastName:       '',
    dni:            '',
    whatsapp:       '',
    customPhotoURL: '',
  });

  const [errors, setErrors] = useState<Partial<typeof form>>({});

  // Pre-rellenar formulario cuando carga el usuario
  useEffect(() => {
    if (!appUser) return;
    setForm({
      firstName:      appUser.firstName       || '',
      lastName:       appUser.lastName        || '',
      dni:            appUser.dni             || '',
      whatsapp:       appUser.whatsapp        || '',
      customPhotoURL: appUser.customPhotoURL  || '',
    });
  }, [appUser]);

  // ── Redirigir si no está autenticado (en efecto, NO en render) ──
  useEffect(() => {
    if (!authLoading && (!firebaseUser || !appUser)) {
      router.replace('/login?callbackUrl=/dashboard/perfil');
    }
  }, [authLoading, firebaseUser, appUser, router]);

  if (authLoading || (!firebaseUser && !authLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" label="Cargando perfil…" />
      </div>
    );
  }

  // Spinner mientras la redirección del efecto se ejecuta
  if (!firebaseUser || !appUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" label="Redirigiendo…" />
      </div>
    );
  }

  // ── Validación ────────────────────────────────────────────
  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.firstName.trim()) e.firstName = 'El nombre es obligatorio.';
    if (!form.lastName.trim())  e.lastName  = 'El apellido es obligatorio.';
    if (form.dni && !/^\d{8}$/.test(form.dni.trim())) {
      e.dni = 'El DNI debe tener exactamente 8 dígitos.';
    }
    if (form.whatsapp && !/^\d{9,15}$/.test(form.whatsapp.replace(/\s+/g, ''))) {
      e.whatsapp = 'Número de WhatsApp inválido.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Subir foto de perfil ──────────────────────────────────
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !firebaseUser) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La foto no debe superar los 5 MB.');
      return;
    }
    setPhotoUploading(true);
    try {
      // Reutilizamos uploadProductImage con el uid como carpeta
      const url = await uploadProductImage(`profile-${firebaseUser.uid}`, file);
      setForm(f => ({ ...f, customPhotoURL: url }));
      toast.success('Foto actualizada. Guarda los cambios para aplicarla.');
    } catch {
      toast.error('No se pudo subir la foto. Intenta de nuevo.');
    } finally {
      setPhotoUploading(false);
    }
    e.target.value = '';
  };

  // ── Guardar perfil ────────────────────────────────────────
  const handleSave = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate() || !firebaseUser) return;
    setSaving(true);
    try {
      await updateUserProfile(firebaseUser.uid, {
        firstName:      form.firstName.trim(),
        lastName:       form.lastName.trim(),
        dni:            form.dni.trim(),
        whatsapp:       form.whatsapp.replace(/\s+/g, ''),
        customPhotoURL: form.customPhotoURL,
      });
      await refreshUser();
      setSaved(true);
      toast.success('Perfil actualizado correctamente ✓');
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('[PerfilPage]', err);
      toast.error('No se pudo guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  // Foto a mostrar (preview inmediato si cambió)
  const displayPhoto = form.customPhotoURL || effectivePhotoURL;
  const initials = (
    (form.firstName[0] ?? appUser.displayName?.[0] ?? '?')
  ).toUpperCase();

  return (
    <div className="max-w-xl space-y-6">
      {/* Cabecera */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="text-text-secondary hover:text-accent transition-colors"
          aria-label="Volver al dashboard"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-section-title">Mi Perfil</h1>
      </div>

      <form onSubmit={handleSave} noValidate className="space-y-6">
        {/* ── Foto de perfil ─────────────────────────────── */}
        <div className="card p-6 flex flex-col items-center gap-4">
          <div className="relative">
            {displayPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayPhoto}
                alt="Foto de perfil"
                className="w-24 h-24 rounded-full object-cover border-2 border-accent"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center text-white text-[32px] font-bold border-2 border-accent">
                {initials}
              </div>
            )}

            {/* Botón de cámara */}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={photoUploading}
              className={clsx(
                'absolute bottom-0 right-0',
                'w-8 h-8 rounded-full bg-accent text-white',
                'flex items-center justify-center',
                'border-2 border-bg-primary',
                'hover:bg-accent-hover transition-colors',
                photoUploading && 'opacity-60 cursor-not-allowed'
              )}
              aria-label="Cambiar foto de perfil"
            >
              {photoUploading
                ? <Spinner size="sm" />
                : <Camera size={14} aria-hidden="true" />}
            </button>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="sr-only"
            aria-label="Subir foto de perfil"
          />

          <div className="text-center">
            <p className="font-semibold text-[17px]">
              {effectiveName || appUser.email}
            </p>
            <p className="text-caption text-text-secondary">{appUser.email}</p>
            <span className={clsx(
              'badge mt-2 inline-flex items-center gap-1',
              appUser.role === 'admin' ? 'badge-accent' : 'badge-neutral'
            )}>
              {appUser.role === 'admin' && (
                <ShieldCheck size={11} aria-hidden="true" />
              )}
              {appUser.role === 'admin' ? 'Administrador' : 'Cliente'}
            </span>
          </div>
        </div>

        {/* ── Datos personales ───────────────────────────── */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-[17px] pb-2 border-b border-border">
            Datos Personales
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre(s)"
              required
              value={form.firstName}
              onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
              error={errors.firstName}
              placeholder="Juan"
              autoComplete="given-name"
            />
            <Input
              label="Apellido(s)"
              required
              value={form.lastName}
              onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
              error={errors.lastName}
              placeholder="Pérez López"
              autoComplete="family-name"
            />
          </div>

          <Input
            label="DNI"
            value={form.dni}
            onChange={e => setForm(f => ({ ...f, dni: e.target.value.replace(/\D/g, '') }))}
            error={errors.dni}
            placeholder="12345678"
            maxLength={8}
            inputMode="numeric"
            hint="8 dígitos numéricos"
          />

          <Input
            label="WhatsApp"
            value={form.whatsapp}
            onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
            error={errors.whatsapp}
            placeholder="51999888777"
            type="tel"
            hint="Incluye el código de país: 51 para Perú"
          />
        </div>

        {/* ── Email (solo lectura) ───────────────────────── */}
        <div className="card p-6 space-y-3">
          <h2 className="font-semibold text-[17px] pb-2 border-b border-border">
            Cuenta
          </h2>
          <div>
            <p className="text-label text-text-secondary mb-1">Email</p>
            <p className="text-[15px] text-text-primary">{appUser.email}</p>
            <p className="text-caption text-text-tertiary mt-0.5">
              El email está vinculado a tu cuenta de Google y no puede modificarse aquí.
            </p>
          </div>
          <div>
            <p className="text-label text-text-secondary mb-1">Miembro desde</p>
            <p className="text-[15px] text-text-primary">
              {appUser.createdAt
                ? new Date(
                    (appUser.createdAt as { toDate(): Date }).toDate()
                  ).toLocaleDateString('es-PE', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })
                : '—'}
            </p>
          </div>
        </div>

        {/* ── Botón guardar ──────────────────────────────── */}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={saving}
          leftIcon={saved ? <CheckCircle size={16} /> : <Save size={16} />}
        >
          {saved ? 'Guardado ✓' : 'Guardar Cambios'}
        </Button>
      </form>
    </div>
  );
}
