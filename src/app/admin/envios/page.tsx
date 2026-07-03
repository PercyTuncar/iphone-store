'use client';

import { useEffect, useState } from 'react';
import { ShippingManager } from '@/components/admin/ShippingManager';
import { Spinner } from '@/components/ui/Spinner';
import { getShippingRates } from '@/lib/firebase/shipping';
import { DEFAULT_SHIPPING_RATES } from '@/lib/constants/departments';

export default function AdminEnviosPage() {
  const [rates,   setRates]   = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getShippingRates()
      .then(r => setRates(r.rates))
      .catch(() => setRates({ ...DEFAULT_SHIPPING_RATES }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-section-title mb-1">Configuración de Fletes</h1>
        <p className="text-body text-text-secondary">
          Define el costo de envío para cada departamento del Perú.
        </p>
      </div>
      {loading || !rates
        ? <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        : <ShippingManager initialRates={rates} />
      }
    </div>
  );
}
