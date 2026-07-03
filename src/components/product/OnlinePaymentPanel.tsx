'use client';

/**
 * OnlinePaymentPanel — redirects to external payment link.
 * PRD §9.2: creates the order, stores orderId, then sends user to the payment link.
 */

import { useState } from 'react';
import { ExternalLink, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatSoles } from '@/lib/utils/currency';

interface OnlinePaymentPanelProps {
  paymentLink: string;
  amountDue: number;
  onProceed: () => Promise<{ orderId: string }>;
}

export function OnlinePaymentPanel({
  paymentLink,
  amountDue,
  onProceed,
}: OnlinePaymentPanelProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const { orderId } = await onProceed();
      // Redirect to external payment gateway in the same tab
      // The gateway will return to /pago-exitoso?orderId=...
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
      const successUrl = `${siteUrl}/pago-exitoso?orderId=${orderId}`;

      // Append the success URL as a query param if the payment link supports it
      // (This is gateway-specific; the admin configures the return URL in the gateway)
      window.location.href = paymentLink;
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Amount summary */}
      <div className="bg-accent/5 border border-accent/20 rounded-[14px] p-4 text-center">
        <p className="text-caption text-text-secondary mb-1">Total a pagar ahora</p>
        <p className="text-[32px] font-bold text-accent">
          S/ {amountDue.toFixed(2)}
        </p>
      </div>

      {/* Security note */}
      <div className="flex items-start gap-3 p-4 bg-success/5 border border-success/20 rounded-[14px]">
        <Lock size={16} className="text-success mt-0.5 flex-shrink-0" aria-hidden="true" />
        <p className="text-[14px] text-text-secondary leading-relaxed">
          Serás redirigido a una página de pago seguro externa.
          Tu información está protegida con encriptación SSL.
          Tras completar el pago, volverás aquí automáticamente.
        </p>
      </div>

      {/* CTA */}
      <Button
        variant="primary"
        fullWidth
        loading={loading}
        onClick={handleClick}
        rightIcon={<ExternalLink size={16} aria-hidden="true" />}
      >
        Ir a la Página de Pago Seguro
      </Button>

      <p className="text-caption text-text-tertiary text-center">
        Luego del pago, regresa a esta página para completar tu pedido.
      </p>
    </div>
  );
}
