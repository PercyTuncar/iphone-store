'use client';

/**
 * UploadVoucher — voucher upload form shown inside the OrderTimeline
 * when the user clicks "Pagar esta cuota".
 * PRD §13.3: select payment method, upload screenshot, confirm.
 */

import { useState, useRef } from 'react';
import { clsx } from 'clsx';
import { Upload, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { uploadVoucher } from '@/lib/firebase/storage';
import { submitVoucher } from '@/lib/firebase/payments';
import { formatSoles } from '@/lib/utils/currency';
import type { Payment } from '@/types/payment';
import type { Order } from '@/types/order';

interface UploadVoucherProps {
  payment: Payment;
  order: Order;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UploadVoucher({ payment, order, onSuccess, onCancel }: UploadVoucherProps) {
  const [file,      setFile]      = useState<File | null>(null);
  const [preview,   setPreview]   = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { toast.error('Máximo 10 MB.'); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { toast.error('Adjunta el comprobante de pago.'); return; }

    setUploading(true);
    try {
      const url = await uploadVoucher(order.id, payment.installmentNumber, file);
      await submitVoucher(payment.id, url, 'customer');
      toast.success(`Cuota ${payment.installmentNumber} enviada para revisión. ✅`);
      onSuccess();
    } catch (err) {
      console.error('[UploadVoucher]', err);
      toast.error('Error al subir. Intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-label text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Volver a la línea de tiempo"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Volver
        </button>
        <div className="h-4 w-px bg-border" aria-hidden="true" />
        <h3 className="text-subtitle text-[17px]">
          Cuota {payment.installmentNumber} — {formatSoles(payment.amount)}
        </h3>
      </div>

      {/* Payment method info */}
      <div className="card p-4">
        <p className="text-label font-semibold mb-3">¿Cómo realizaste el pago?</p>
        <div className="space-y-2">
          {order.paymentMethod === 'offline' ? (
            <div className="text-[14px] text-text-secondary space-y-1">
              <p>Realiza la transferencia al mismo número/cuenta del primer pago.</p>
              <p className="font-medium text-text-primary">
                Monto: {formatSoles(payment.amount)}
              </p>
            </div>
          ) : (
            <a
              href={order.productId}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary text-[14px] px-4 py-2"
            >
              Ir al link de pago online →
            </a>
          )}
        </div>
      </div>

      {/* Upload form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-label text-text-primary mb-2">
            Sube tu comprobante <span className="text-danger">*</span>
          </p>
          {preview ? (
            <div className="relative rounded-[12px] overflow-hidden border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Comprobante" className="w-full max-h-52 object-contain bg-bg-secondary" />
              <button
                type="button"
                onClick={() => { setFile(null); setPreview(null); }}
                className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                aria-label="Quitar imagen"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-border rounded-[14px] p-8 flex flex-col items-center gap-3 text-text-secondary hover:border-accent hover:text-accent transition-colors"
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

        <Button type="submit" variant="primary" fullWidth loading={uploading}>
          {uploading ? 'Enviando comprobante…' : 'Confirmar pago'}
        </Button>
      </form>
    </div>
  );
}
