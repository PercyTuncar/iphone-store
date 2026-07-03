'use client';

/**
 * ShippingManager — editable rate table for all 25 Peruvian departments.
 * PRD §12.6: admin updates rates and saves with one click.
 */

import { useState } from 'react';
import { Save, Truck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { updateShippingRates } from '@/lib/firebase/shipping';
import { PERU_DEPARTMENTS } from '@/lib/constants/departments';

interface ShippingManagerProps {
  initialRates: Record<string, number>;
}

export function ShippingManager({ initialRates }: ShippingManagerProps) {
  const [rates,   setRates]   = useState<Record<string, number>>({ ...initialRates });
  const [saving,  setSaving]  = useState(false);
  const [dirty,   setDirty]   = useState(false);

  const handleChange = (dept: string, value: string) => {
    const num = parseFloat(value);
    setRates(r => ({ ...r, [dept]: isNaN(num) ? 0 : num }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateShippingRates(rates);
      toast.success('Tarifas actualizadas ✓');
      setDirty(false);
    } catch {
      toast.error('Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-semibold text-[17px]">Tarifas por Departamento</h2>
          <p className="text-caption text-text-secondary mt-0.5">
            Lima = S/ 0 (envío incluido). Los cambios aplican a todos los productos.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleSave}
          loading={saving}
          disabled={!dirty}
          leftIcon={<Save size={15} />}
        >
          Guardar cambios
        </Button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="divide-y divide-border">
          {PERU_DEPARTMENTS.map((dept) => (
            <div
              key={dept}
              className="flex items-center justify-between px-5 py-3 hover:bg-bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Truck size={15} className="text-text-tertiary" aria-hidden="true" />
                <span className="text-[15px] font-medium">{dept}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-label text-text-secondary">S/</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={rates[dept] ?? 0}
                  onChange={e => handleChange(dept, e.target.value)}
                  className="w-20 text-right input py-1.5 px-2 text-[15px]"
                  aria-label={`Costo de envío a ${dept}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
