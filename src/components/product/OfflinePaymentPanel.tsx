'use client';

/**
 * OfflinePaymentPanel — shows Yape/transfer payment data + voucher upload form.
 * PRD §9.3: displays payment details with copy buttons, then voucher upload.
 */

import { useState, useRef } from 'react';
import { clsx } from 'clsx';
import { Copy, Check, Upload, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from '@/components/ui/Toast';
import type { Product } from '@/types/product';

interface ShippingData {
  name: string;
  dni: string;
  phone: string;
  department: string;
  province: string;
  district: string;
  address: string;
}

interface OfflinePaymentPanelProps {
  product: Product;
  amountDue: number;
  onSubmit: (voucher: File, shipping: ShippingData) => Promise<void>;
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-border last:border-0">
      <div>
        <p className="text-caption text-text-tertiary">{label}</p>
        <p className="text-[15px] font-semibold text-text-primary">{value}</p>
      </div>
      <button
        onClick={copy}
        className={clsx(
          'flex items-center gap-1.5 text-caption px-3 py-1.5 rounded-lg transition-colors',
          copied ? 'bg-success/10 text-success' : 'bg-bg-secondary text-text-secondary hover:bg-border'
        )}
        aria-label={`Copiar ${label}`}
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
        {copied ? 'Copiado' : 'Copiar'}
      </button>
    </div>
  );
}

const DEPARTMENTS = [
  'Lima', 'Callao', 'Arequipa', 'Cusco', 'La Libertad', 'Piura',
  'Lambayeque', 'Junín', 'Ica', 'Áncash', 'Cajamarca', 'Puno',
  'Tacna', 'Moquegua', 'Ayacucho', 'Huancavelica', 'Apurímac',
  'Huánuco', 'Pasco', 'San Martín', 'Amazonas', 'Loreto',
  'Madre de Dios', 'Ucayali', 'Tumbes',
];

export function OfflinePaymentPanel({ product, amountDue, onSubmit }: OfflinePaymentPanelProps) {
  const [step, setStep] = useState<'info' | 'form'>('info');
  const [loading, setLoading] = useState(false);
  const [voucher, setVoucher] = useState<File | null>(null);
  const [voucherPreview, setVoucherPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ShippingData>({
    name: '', dni: '', phone: '',
    department: '', province: '', district: '', address: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingData, string>>>({});

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo no puede superar los 10 MB.');
      return;
    }
    setVoucher(file);
    setVoucherPreview(URL.createObjectURL(file));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof ShippingData, string>> = {};
    if (!form.name.trim())       e.name       = 'Nombre requerido';
    if (!form.dni.trim())        e.dni        = 'DNI requerido';
    if (!form.phone.trim())      e.phone      = 'Teléfono requerido';
    if (!form.department)        e.department = 'Departamento requerido';
    if (!form.address.trim())    e.address    = 'Dirección requerida';
    if (!voucher)                toast.error('Adjunta el comprobante de pago.');
    setErrors(e);
    return Object.keys(e).length === 0 && !!voucher;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit(voucher!, form);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'info') {
    return (
      <div className="space-y-5">
        {/* Amount */}
        <div className="bg-accent/5 border border-accent/20 rounded-[14px] p-4 text-center">
          <p className="text-caption text-text-secondary mb-1">Monto a transferir</p>
          <p className="text-[32px] font-bold text-accent">
            S/ {amountDue.toFixed(2)}
          </p>
        </div>

        {/* Yape */}
        {product.isYapeEnabled && product.yapeNumber && (
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-[#7E2DFF] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0" aria-hidden="true">Y</span>
              <span className="font-semibold text-[15px]">Yape / Plin</span>
            </div>
            <CopyField label="Número" value={product.yapeNumber} />
            <CopyField label="Titular" value={product.transferAccountHolder} />
          </div>
        )}

        {/* Transfer */}
        {product.transferAccountNumber && (
          <div className="card p-4">
            <p className="font-semibold text-[15px] mb-3">🏦 Transferencia Bancaria</p>
            <CopyField label="Banco"           value={product.transferBank} />
            <CopyField label="Titular"         value={product.transferAccountHolder} />
            <CopyField label="Número de cuenta" value={product.transferAccountNumber} />
            <CopyField label="CCI"             value={product.transferCci} />
          </div>
        )}

        {/* Instructions */}
        <ol className="list-decimal list-inside space-y-2 text-[15px] text-text-secondary">
          <li>Realiza la transferencia al número o cuenta indicado.</li>
          <li>Toma una captura de pantalla del comprobante.</li>
          <li>Sube tu comprobante y completa tus datos de envío.</li>
        </ol>

        <Button
          variant="primary"
          fullWidth
          onClick={() => setStep('form')}
        >
          Ya realicé el pago — Subir comprobante
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Voucher upload */}
      <div>
        <p className="text-label text-text-primary mb-2">
          Comprobante de pago <span className="text-danger">*</span>
        </p>
        {voucherPreview ? (
          <div className="relative rounded-[10px] overflow-hidden border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={voucherPreview} alt="Vista previa del comprobante" className="w-full max-h-48 object-contain bg-bg-secondary" />
            <button
              type="button"
              onClick={() => { setVoucher(null); setVoucherPreview(null); }}
              className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80"
              aria-label="Quitar imagen"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-border rounded-[14px] p-8 flex flex-col items-center gap-2 text-text-secondary hover:border-accent hover:text-accent transition-colors"
          >
            <Upload size={24} aria-hidden="true" />
            <span className="text-[15px] font-medium">Subir captura de pantalla</span>
            <span className="text-caption">JPG, PNG, WebP · Máx. 10 MB</span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="sr-only"
          aria-label="Subir comprobante"
        />
      </div>

      {/* Shipping form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Nombre completo" required value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          error={errors.name} placeholder="Juan Pérez López" />
        <Input label="DNI" required value={form.dni}
          onChange={e => setForm(f => ({ ...f, dni: e.target.value }))}
          error={errors.dni} placeholder="12345678" maxLength={8} />
        <Input label="Teléfono" required value={form.phone}
          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
          error={errors.phone} placeholder="999 999 999" type="tel" />

        <div className="flex flex-col gap-1.5">
          <label className="text-label text-text-primary">
            Departamento <span className="text-danger">*</span>
          </label>
          <select
            value={form.department}
            onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
            className={clsx('input', errors.department && 'input-error')}
            aria-invalid={!!errors.department}
          >
            <option value="">Seleccionar…</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          {errors.department && <p className="text-label text-danger">{errors.department}</p>}
        </div>

        <Input label="Provincia" value={form.province}
          onChange={e => setForm(f => ({ ...f, province: e.target.value }))}
          placeholder="Lima" />
        <Input label="Distrito" value={form.district}
          onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
          placeholder="Miraflores" />
      </div>

      <Input label="Dirección completa" required value={form.address}
        onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
        error={errors.address} placeholder="Av. Principal 123, Dpto. 4B — Referencia: cerca al parque" />

      <Button type="submit" variant="primary" fullWidth loading={loading}>
        {loading ? 'Enviando…' : 'Confirmar y Enviar Pedido'}
      </Button>

      <button type="button" onClick={() => setStep('info')}
        className="w-full text-caption text-text-secondary hover:text-text-primary transition-colors">
        ← Volver a los datos de pago
      </button>
    </form>
  );
}
