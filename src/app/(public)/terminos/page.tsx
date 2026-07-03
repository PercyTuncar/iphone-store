/**
 * /terminos — Términos y Condiciones
 * PRD §20: Complete legal document covering penalties, no-refund policy,
 * insurance conditions, reservation process, and business data.
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description:
    'Conoce las condiciones de compra, política de penalidades, seguros de prórroga y política de no devolución de iPhone en Cuotas.',
  robots: { index: true, follow: true },
};

export default function TerminosPage() {
  return (
    <main className="min-h-screen bg-bg-primary py-20">
      <div className="container-main max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <p className="text-label text-accent uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-section-title mb-4">Términos y Condiciones de Compra</h1>
          <p className="text-body text-text-secondary">
            Última actualización: julio 2025. Estos términos rigen toda compra
            realizada a través de <strong>iphoneencuotas.com</strong>.
          </p>
        </div>

        <div className="prose max-w-none space-y-10">

          {/* 1 */}
          <Section title="1. Identificación del Negocio">
            <p>
              <strong>iPhone en Cuotas</strong> es un negocio unipersonal que opera bajo
              el dominio <strong>iphoneencuotas.com</strong>. Ventas de equipos Apple
              (iPhones) nuevos y reacondicionados en el mercado peruano a través del
              sistema de cuotas. Contacto:{' '}
              <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '51944784488'}`}
                 className="text-accent" target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>.
            </p>
          </Section>

          {/* 2 */}
          <Section title="2. Proceso de Reserva y Vigencia">
            <p>
              Al iniciar el proceso de reserva, el cliente tiene exactamente{' '}
              <strong>24 horas</strong> para completar y enviar el comprobante de pago
              de la primera cuota. Si transcurren 24 horas sin confirmación de pago, la
              reserva se cancela automáticamente y el stock del equipo queda disponible
              para otros compradores. No se aplica ninguna penalidad en este caso.
            </p>
            <p>
              El proceso de compra se considera iniciado únicamente cuando el
              administrador aprueba el primer pago. Hasta ese momento, no existe
              obligación contractual por ninguna de las partes.
            </p>
          </Section>

          {/* 3 */}
          <Section title="3. Política de Penalidades por Atraso">
            <p>
              Una vez que el pedido está activo (primer pago aprobado), el cliente
              se compromete a pagar cada cuota mensual antes de su fecha de vencimiento.
              Las penalidades aplicables por atraso son las siguientes:
            </p>
            <div className="overflow-x-auto my-4">
              <table className="w-full text-[15px] border-collapse">
                <thead>
                  <tr className="bg-bg-secondary">
                    <th className="text-left px-4 py-3 font-semibold border border-border">Días de atraso</th>
                    <th className="text-left px-4 py-3 font-semibold border border-border">Penalidad adicional</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['1 a 5 días',  'S/ 59 sobre el monto de la cuota'],
                    ['6 a 10 días', 'S/ 79 sobre el monto de la cuota'],
                    ['11 a 15 días','S/ 99 sobre el monto de la cuota'],
                    ['Más de 15 días','Cancelación del pedido (ver §4)'],
                  ].map(([days, penalty]) => (
                    <tr key={days}>
                      <td className="px-4 py-3 border border-border">{days}</td>
                      <td className="px-4 py-3 border border-border font-medium">{penalty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Las penalidades se calculan a partir de la fecha de vencimiento de la cuota
              y se acumulan automáticamente. El sistema muestra el monto actualizado en el
              dashboard del cliente en tiempo real.
            </p>
          </Section>

          {/* 4 */}
          <Section title="4. Política de No Devolución en Caso de Mora">
            <p className="font-semibold text-danger">
              ⚠ IMPORTANTE: Si el cliente acumula más de 15 días de atraso en el pago de
              una cuota sin haber cubierto la deuda ni utilizar el seguro de prórroga, el
              pedido se cancela automáticamente de forma definitiva.
            </p>
            <p>
              En este caso:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[15px]">
              <li>El equipo NO se entrega al cliente.</li>
              <li>
                Todos los pagos realizados hasta la fecha de cancelación quedan en favor
                de iPhone en Cuotas como compensación por el período de reserva y los
                costos operativos incurridos. <strong>No se realizan devoluciones</strong>.
              </li>
              <li>El stock del equipo es liberado para nuevos compradores.</li>
            </ul>
            <p>
              Esta política es aplicable exclusivamente a partir de la cuota número 2 en
              adelante. Si el primer pago es rechazado por el administrador, no se aplica
              ninguna penalidad y el proceso no se considera iniciado.
            </p>
          </Section>

          {/* 5 */}
          <Section title="5. Rechazo de Comprobante y Plazo de Reenvío">
            <p>
              Si el administrador rechaza un comprobante de pago de la cuota 2 en
              adelante, el cliente tiene <strong>24 horas</strong> desde el momento del
              rechazo para subir un nuevo comprobante válido. El sistema muestra una
              cuenta regresiva en el dashboard del cliente.
            </p>
            <p>
              Si el cliente no reenvía un comprobante dentro de ese plazo, la cuota pasa
              automáticamente a estado de mora y comienzan a aplicarse las penalidades
              descritas en la sección anterior.
            </p>
            <p>
              Para el primer pago: si el comprobante es rechazado, el proceso simplemente
              no inicia. El cliente puede intentarlo de nuevo desde cero sin consecuencias.
            </p>
          </Section>

          {/* 6 */}
          <Section title="6. Seguro de Prórroga">
            <p>
              El Seguro de Prórroga es un producto adicional opcional que permite al
              cliente extender el plazo de pago de una o más cuotas sin incurrir en
              penalidades. Las condiciones son:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[15px]">
              <li>
                <strong>Planes disponibles:</strong> 1 mes (S/ 49), 2 meses (S/ 89) o
                3 meses (S/ 99). En el checkout, el plan de 1 mes tiene un precio especial.
              </li>
              <li>
                <strong>Ventana de compra:</strong> El seguro debe adquirirse ANTES de
                que venza la cuota activa. Una vez vencida la cuota (aunque sea por
                1 minuto), no es posible comprar el seguro y la penalidad aplica.
              </li>
              <li>
                <strong>Aplicación automática:</strong> Cuando el seguro está activo y
                una cuota vence, el sistema la cubre automáticamente sin que el cliente
                deba hacer nada. La cuota recibe una extensión de 1 mes.
              </li>
              <li>
                <strong>Meses restantes:</strong> Si el cliente compró un seguro de 2
                meses y solo usa 1, el mes restante se aplica automáticamente a la
                siguiente cuota en riesgo.
              </li>
            </ul>
          </Section>

          {/* 7 */}
          <Section title="7. Entrega del Equipo">
            <p>
              El equipo es enviado una vez que todas las cuotas del plan han sido pagadas
              y aprobadas. El costo de envío se paga junto con la primera cuota y varía
              según el departamento de destino (Lima: envío gratuito; provincias: según
              tarifa vigente).
            </p>
            <p>
              La fecha estimada de entrega es informada por el administrador a través del
              dashboard del cliente. Los tiempos de entrega pueden variar según la
              disponibilidad del courier y la ubicación del cliente.
            </p>
          </Section>

          {/* 8 */}
          <Section title="8. Garantía de los Equipos">
            <p>
              Los equipos <strong>nuevos</strong> cuentan con garantía oficial de Apple
              (12 meses). Los equipos <strong>reacondicionados</strong> cuentan con una
              garantía limitada de 3 meses ofrecida por iPhone en Cuotas, que cubre
              defectos de funcionamiento no provocados por el usuario.
            </p>
            <p>
              La garantía no cubre daños físicos, líquidos, o por uso inadecuado.
              Para hacer uso de la garantía, el cliente debe contactarnos por WhatsApp
              con una descripción del problema y fotos del equipo.
            </p>
          </Section>

          {/* 9 */}
          <Section title="9. Modificaciones a estos Términos">
            <p>
              iPhone en Cuotas se reserva el derecho de modificar estos términos en
              cualquier momento. Los cambios entran en vigencia desde su publicación en
              esta página. Los pedidos en curso se rigen por los términos vigentes al
              momento de la reserva.
            </p>
          </Section>

          {/* 10 */}
          <Section title="10. Aceptación">
            <p>
              Al marcar la casilla de aceptación en el modal de compra y proceder con
              el pago, el cliente declara haber leído, entendido y aceptado íntegramente
              estos Términos y Condiciones.
            </p>
          </Section>

        </div>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[22px] font-semibold mb-4 pb-2 border-b border-border">{title}</h2>
      <div className="space-y-3 text-body leading-relaxed">{children}</div>
    </section>
  );
}
