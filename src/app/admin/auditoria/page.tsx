'use client';

import { useEffect, useState } from 'react';
import { AuditLog } from '@/components/admin/AuditLog';
import { Spinner } from '@/components/ui/Spinner';
import { getAuditLogs, type AuditLogEntry } from '@/lib/firebase/audit';

export default function AdminAuditoriaPage() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAuditLogs()
      .then(setEntries)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-section-title mb-1">Auditoría</h1>
        <p className="text-body text-text-secondary">
          Historial completo de acciones del administrador.
        </p>
      </div>
      {loading
        ? <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        : <AuditLog entries={entries} />
      }
    </div>
  );
}
