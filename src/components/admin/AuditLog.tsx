/**
 * AuditLog — chronological table of admin actions.
 * PRD §19.2: filtrable by action type, target, date range.
 */

import { clsx } from 'clsx';
import Link from 'next/link';
import { AUDIT_ACTIONS } from '@/lib/firebase/audit';
import type { AuditLogEntry } from '@/lib/firebase/audit';

interface AuditLogProps {
  entries: AuditLogEntry[];
}

const ACTION_LABELS: Record<string, string> = {
  [AUDIT_ACTIONS.APPROVE_PAYMENT]:          'Aprobó pago',
  [AUDIT_ACTIONS.REJECT_PAYMENT]:           'Rechazó pago',
  [AUDIT_ACTIONS.PUBLISH_PRODUCT]:          'Publicó producto',
  [AUDIT_ACTIONS.ARCHIVE_PRODUCT]:          'Archivó producto',
  [AUDIT_ACTIONS.DELETE_PRODUCT]:           'Eliminó producto',
  [AUDIT_ACTIONS.APPROVE_REVIEW]:           'Aprobó reseña',
  [AUDIT_ACTIONS.REJECT_REVIEW]:            'Rechazó reseña',
  [AUDIT_ACTIONS.FEATURE_REVIEW]:           'Destacó reseña',
  [AUDIT_ACTIONS.UPDATE_ORDER_STATUS]:      'Actualizó estado del pedido',
  [AUDIT_ACTIONS.UPDATE_DELIVERY_STATUS]:   'Actualizó envío',
  [AUDIT_ACTIONS.SEND_ABANDONMENT_NOTIFICATION]: 'Envió recordatorio',
  [AUDIT_ACTIONS.CANCEL_ORDER]:             'Canceló pedido',
  [AUDIT_ACTIONS.DEFAULT_ORDER]:            'Marcó pedido como moroso',
};

const ACTION_COLORS: Partial<Record<string, string>> = {
  [AUDIT_ACTIONS.APPROVE_PAYMENT]:  'text-success',
  [AUDIT_ACTIONS.REJECT_PAYMENT]:   'text-danger',
  [AUDIT_ACTIONS.DELETE_PRODUCT]:   'text-danger',
  [AUDIT_ACTIONS.CANCEL_ORDER]:     'text-danger',
  [AUDIT_ACTIONS.DEFAULT_ORDER]:    'text-danger',
  [AUDIT_ACTIONS.PUBLISH_PRODUCT]:  'text-accent',
};

const TARGET_HREF: Record<string, (id: string) => string> = {
  payment: (id) => `/admin/pedidos?payment=${id}`,
  order:   (id) => `/admin/pedidos/${id}`,
  product: (id) => `/admin/productos/${id}`,
  review:  (id) => `/admin/resenas`,
};

export function AuditLog({ entries }: AuditLogProps) {
  if (entries.length === 0) {
    return (
      <div className="card p-12 text-center text-body text-text-secondary">
        No hay entradas de auditoría aún.
      </div>
    );
  }

  return (
    <div className="card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="border-b border-border bg-bg-secondary">
              <th className="text-left px-4 py-3 font-semibold text-text-secondary whitespace-nowrap">Fecha y hora</th>
              <th className="text-left px-4 py-3 font-semibold text-text-secondary">Acción</th>
              <th className="text-left px-4 py-3 font-semibold text-text-secondary">Admin</th>
              <th className="text-left px-4 py-3 font-semibold text-text-secondary">Documento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.map((entry) => {
              const ts = entry.timestamp
                ? (entry.timestamp as unknown as { toDate(): Date }).toDate()
                : null;
              const hrefFn = TARGET_HREF[entry.targetType];
              const href   = hrefFn?.(entry.targetId);

              return (
                <tr key={entry.id} className="hover:bg-bg-secondary/50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-text-secondary">
                    {ts ? ts.toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx('font-medium', ACTION_COLORS[entry.action] ?? 'text-text-primary')}>
                      {ACTION_LABELS[entry.action] ?? entry.action}
                    </span>
                    {entry.details && Object.keys(entry.details).length > 0 && (
                      <p className="text-caption text-text-tertiary mt-0.5">
                        {JSON.stringify(entry.details).slice(0, 80)}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-secondary truncate max-w-[160px]">
                    {entry.adminEmail}
                  </td>
                  <td className="px-4 py-3">
                    {href ? (
                      <Link href={href} className="text-accent hover:underline text-[13px] font-mono">
                        {entry.targetId.slice(0, 12)}…
                      </Link>
                    ) : (
                      <span className="text-[13px] font-mono text-text-tertiary">
                        {entry.targetId.slice(0, 12)}…
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
