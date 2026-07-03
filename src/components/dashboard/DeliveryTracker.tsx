'use client';

/**
 * DeliveryTracker — shipping status display for the client dashboard.
 * PRD §13.4: three states: Preparando → En camino → Entregado
 * Updates in real-time via Firestore onSnapshot (order.delivery.status).
 */

import { clsx } from 'clsx';
import { Package, Truck, CheckCircle, MessageCircle } from 'lucide-react';
import { formatDueDate, toDate } from '@/lib/utils/dates';
import type { Order } from '@/types/order';

interface DeliveryTrackerProps {
  order: Order;
}

const STEPS = [
  {
    id: 'preparing' as const,
    label: 'Preparando tu iPhone',
    icon: Package,
    desc: 'Verificando el equipo antes del envío.',
  },
  {
    id: 'in_transit' as const,
    label: 'En camino',
    icon: Truck,
    desc: 'Tu iPhone está en ruta hacia tu dirección.',
  },
  {
    id: 'delivered' as const,
    label: 'Entregado',
    icon: CheckCircle,
    desc: '¡Tu iPhone llegó! Disfrútalo.',
  },
] as const;

const STATUS_ORDER = ['not_started', 'preparing', 'in_transit', 'delivered'] as const;

export function DeliveryTracker({ order }: DeliveryTrackerProps) {
  const { delivery, customerName, productTitle, id: orderId } = order;
  const currentIdx = STATUS_ORDER.indexOf(delivery.status);

  // WhatsApp message pre-filled
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '51944784488';
  const waMessage = encodeURIComponent(
    `Hola, soy ${customerName}, mi pedido ${orderId} está completamente pagado. Quiero coordinar la entrega de mi ${productTitle}.`
  );
  const waUrl = `https://wa.me/${whatsapp}?text=${waMessage}`;

  return (
    <div className="card p-5 space-y-5">
      <h3 className="font-semibold text-[17px]">Estado de Envío</h3>

      {/* Estimated date */}
      {delivery.estimatedDate && delivery.status !== 'delivered' && (
        <div className="flex items-center gap-2 bg-accent/5 border border-accent/20 rounded-[10px] px-4 py-3">
          <Truck size={16} className="text-accent flex-shrink-0" aria-hidden="true" />
          <p className="text-[14px] text-text-secondary">
            Fecha estimada de entrega:{' '}
            <strong className="text-text-primary">
              {formatDueDate(toDate(delivery.estimatedDate as never))}
            </strong>
          </p>
        </div>
      )}

      {/* Delivered date */}
      {delivery.status === 'delivered' && delivery.deliveredAt && (
        <div className="flex items-center gap-2 bg-success/5 border border-success/20 rounded-[10px] px-4 py-3">
          <CheckCircle size={16} className="text-success flex-shrink-0" aria-hidden="true" />
          <p className="text-[14px] text-text-secondary">
            Entregado el{' '}
            <strong className="text-text-primary">
              {formatDueDate(toDate(delivery.deliveredAt as never))}
            </strong>
          </p>
        </div>
      )}

      {/* Step indicators */}
      <div className="flex items-start gap-0">
        {STEPS.map((step, i) => {
          const stepIdx   = i + 1; // not_started = 0
          const isDone    = currentIdx >= stepIdx;
          const isCurrent = currentIdx === stepIdx;
          const isLast    = i === STEPS.length - 1;
          const StepIcon  = step.icon;

          return (
            <div key={step.id} className="flex flex-1 flex-col items-center">
              {/* Connector + node row */}
              <div className="flex items-center w-full">
                {i > 0 && (
                  <div className={clsx(
                    'flex-1 h-0.5 transition-colors duration-500',
                    isDone ? 'bg-accent' : 'bg-border'
                  )} aria-hidden="true" />
                )}

                <div className={clsx(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0',
                  isDone    && 'bg-accent text-white',
                  isCurrent && !isDone && 'border-2 border-accent text-accent animate-pulse-slow',
                  !isDone   && !isCurrent && 'border-2 border-border text-text-tertiary bg-bg-secondary'
                )}>
                  <StepIcon size={18} aria-hidden="true" />
                </div>

                {!isLast && (
                  <div className={clsx(
                    'flex-1 h-0.5 transition-colors duration-500',
                    currentIdx > stepIdx ? 'bg-accent' : 'bg-border'
                  )} aria-hidden="true" />
                )}
              </div>

              {/* Label */}
              <p className={clsx(
                'text-[12px] font-medium text-center mt-2 px-1',
                isDone ? 'text-accent' : 'text-text-secondary'
              )}>
                {step.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Current step description */}
      {delivery.status !== 'not_started' && (
        <p className="text-[14px] text-text-secondary text-center">
          {STEPS.find(s => s.id === delivery.status)?.desc ?? ''}
        </p>
      )}

      {/* WhatsApp CTA — visible until delivered */}
      {delivery.status !== 'delivered' && delivery.status !== 'not_started' && (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 btn btn-secondary text-[15px] py-3"
          aria-label="Coordinar entrega por WhatsApp"
        >
          <MessageCircle size={16} aria-hidden="true" />
          Coordinar entrega por WhatsApp
        </a>
      )}
    </div>
  );
}
