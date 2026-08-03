'use client';

import { Suspense } from 'react';
import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { clsx } from 'clsx';
import { Upload, X, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from '@/components/ui/Toast';
import { ClientMetadata } from '@/components/seo/ClientMetadata';
import { uploadVoucher } from '@/lib/firebase/storage';
import { createPayment } from '@/lib/firebase/payments';
import { updateOrder } from '@/lib/firebase/orders';
import { getShippingCost } from '@/lib/firebase/shipping';
import { useAuth } from '@/lib/hooks/useAuth';
import { Timestamp } from 'firebase/firestore';

const DEPARTMENTS = [
  'Lima','Callao','Arequipa','Cusco','La Libertad','Piura','Lambayeque',
  'Junín','Ica','Áncash','Cajamarca','Puno','Tacna','Moquegua','Ayacucho',
  'Huancavelica','Apurímac','Huánuco','Pasco','San Martín','Amazonas',
  'Loreto','Madre de Dios','Ucayali','Tumbes',
];

export default function PagoExitosoPage() {
  return (
    <>
      <ClientMetadata title="Pago Exitoso" noindex={true} />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-bg-secondary"><div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>}>
        <PagoExitosoInner />
      </Suspense>
    </>
  );
}

function PagoExitosoInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { firebaseUser, loading: authLoading } = useAuth();

  const orderId = searchParams.get('orderId') ??
    (typeof window !== 'undefined' ? localStorage.getItem('pendingOrderId') : '') ?? '';

  const [submitted,  setSubmitted]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [voucher,    setVoucher]    = useState<File | null>(null);
  const [preview,    setPreview]    = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '', dni: '', phone: '',
    department: '', province: '', district: '', address: '',
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  useEffect(() => {
    if (firebaseUser?.displayName && !form.name) {
      setForm(f => ({ ...f, name: firebaseUser.displayName ?? '' }));
    }
  }, [firebaseUser]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Archivo muy grande (máx. 10 MB)'); return; }
    setVoucher(file);
    setPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim())    e.name       = 'Requerido';
    if (!form.dni.trim())     e.dni        = 'Requerido';
    if (!form.phone.trim())   e.phone      = 'Requerido';
    if (!form.department)     e.department = 'Requerido';
    if (!form.address.trim()) e.address    = 'Requerido';
    setErrors(e);
    if (!voucher) toast.error('Adjunta el comprobante de pago.');
    return Object.keys(e).length === 0 && !!voucher;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate() || !orderId || !firebaseUser) return;
    setSubmitting(true);
    try {
      const [voucherUrl, shippingCost] = await Promise.all([
        uploadVoucher(orderId, 1, voucher!),
        getShippingCost(form.department),
      ]);
      await updateOrder(orderId, {
        customerName:  form.name,
        customerDni:   form.dni,
        customerPhone: form.phone,
        shippingAddress: {
          department: form.department,
          province:   form.province,
          district:   form.district,
          address:    form.address,
        },
        shippingCost,
      });
      await createPayment({
        orderId,
        userId:            firebaseUser.uid,
        installmentNumber: 1,
        amount:            0,
        dueDate:           Timestamp.fromDate(new Date(Date.now() + 24 * 3600 * 1000)),
        voucherUrl,
        voucherUploadedAt:  Timestamp.now(),
        voucherUploadedBy:  'customer',
        status:            'pending_approval',
        penaltyApplied:    false,
        penaltyAmount:     null,
        penaltyAppliedAt:  null,
        rejectionReason:   null,
        rejectedAt:        null,
        resubmitDeadline:  null,
        approvedBy:        null,
        approvedAt:        null,
      });
      if (typeof window !== 'undefined') localStorage.removeItem('pendingOrderId');
      setSubmitted(true);
    } catch (err) {
      console.error('[pago-exitoso]', err);
      toast.error('Hubo un error. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return (
    <main className="min-h-screen flex items-center justify-center bg-bg-secondary">
      <Spinner size="lg" />
    </main>
  );

  if (submitted) return (
    <main className="min-h-screen flex items-center justify-center bg-bg-secondary px-4">
      <div className="w-full max-w-sm bg-bg-card rounded-[24px] shadow-floating p-8 text-center animate-scale-in">
        <CheckCircle size={56} className="text-success mx-auto mb-5" />
        <h1 className="text-subtitle mb-3">¡Pedido Confirmado!</h1>
        <p className="text-body text-text-secondary mb-7">
          Tu comprobante fue enviado. Te confirmamos en pocas horas desde tu dashboard.
        </p>
        <Button variant="primary" fullWidth onClick={() => router.push('/dashboard')}>
          Ver mi pedido
        </Button>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-bg-secondary py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-bg-card rounded-[24px] shadow-floating p-8 animate-scale-in">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3" aria-hidden="true">🎉</div>
            <h1 className="text-subtitle mb-2">¡Pago completado!</h1>
            <p className="text-body text-text-secondary">
              Sube tu comprobante y completa tus datos de envío para confirmar tu pedido.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Voucher */}
            <div>
              <p className="text-label text-text-primary mb-2">
                Comprobante <span className="text-danger">*</span>
              </p>
              {preview ? (
                <div className="relative rounded-[10px] overflow-hidden border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Comprobante" className="w-full max-h-48 object-contain bg-bg-secondary" />
                  <button type="button"
                    onClick={() => { setVoucher(null); setPreview(null); }}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center"
                    aria-label="Quitar imagen">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-border rounded-[14px] p-6 flex flex-col items-center gap-2 text-text-secondary hover:border-accent hover:text-accent transition-colors">
                  <Upload size={22} aria-hidden="true" />
                  <span className="text-[15px] font-medium">Subir captura del pago</span>
                  <span className="text-caption">JPG, PNG · Máx. 10 MB</span>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="sr-only" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Input label="Nombre completo" required value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} error={errors.name} />
              </div>
              <Input label="DNI" required value={form.dni}
                onChange={e => setForm(f => ({ ...f, dni: e.target.value }))} error={errors.dni} maxLength={8} />
              <Input label="Teléfono" required value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} error={errors.phone} type="tel" />
              <div className="flex flex-col gap-1.5">
                <label className="text-label text-text-primary">Departamento <span className="text-danger">*</span></label>
                <select value={form.department}
                  onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                  className={clsx('input', errors.department && 'input-error')}>
                  <option value="">Seleccionar…</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.department && <p className="text-label text-danger">{errors.department}</p>}
              </div>
              <Input label="Provincia" value={form.province}
                onChange={e => setForm(f => ({ ...f, province: e.target.value }))} placeholder="Lima" />
              <div className="col-span-2">
                <Input label="Distrito" value={form.district}
                  onChange={e => setForm(f => ({ ...f, district: e.target.value }))} placeholder="Miraflores" />
              </div>
            </div>

            <Input label="Dirección completa" required value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              error={errors.address} placeholder="Av. Principal 123, Dpto. 4B" />

            <Button type="submit" variant="primary" fullWidth loading={submitting}>
              Confirmar Pedido
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
