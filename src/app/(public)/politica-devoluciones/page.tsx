/**
 * /politica-devoluciones — Política de Devoluciones
 * Página dedicada que explica la política de no devolución y las condiciones
 * de cancelación del pedido según el PRD §20.
 */

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Política de Devoluciones',
  description:
    'Conoce nuestra política de devoluciones y cancelación de pedidos. Información sobre reembolsos, garantías y condiciones de compra en iPhone en Cuotas.',
  alternates: {
    canonical: '/politica-devoluciones',
  },
  robots: { index: true, follow: true },
};

export default function PoliticaDevolucionesPage() {
  return (
    <main className="min-h-screen bg-bg-primary py-20">
      <div className="container-main max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <p className="text-label text-accent uppercase tracking-widest mb-3">Políticas</p>
          <h1 className="text-section-title mb-4">Política de Devoluciones</h1>
          <p className="text-body text-text-secondary">
            Última actualización: agosto 2026. Esta política aplica a todas las compras
            realizadas en <strong>iphoneencuotas.com</strong>.
          </p>
        </div>

        <div className="prose max-w-none space-y-10">

          {/* Resumen ejecutivo */}
          <Section title="Resumen de la Política">
            <div className="bg-bg-secondary border border-border rounded-lg p-6">
              <p className="font-semibold mb-3">
                iPhone en Cuotas opera bajo un sistema de financiamiento sin tarjeta.
                Nuestra política de devoluciones se rige por las siguientes condiciones:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[15px]">
                <li>
                  <strong>Antes del primer pago aprobado:</strong> Puedes cancelar tu
                  reserva sin ninguna penalidad ni cargo.
                </li>
                <li>
                  <strong>Después del primer pago aprobado:</strong> El pedido está activo
                  y no se realizan devoluciones de dinero si decides cancelar.
                </li>
                <li>
                  <strong>Equipos entregados:</strong> Los equipos nuevos cuentan con
                  garantía de Apple. Los reacondicionados tienen 3 meses de garantía limitada.
                </li>
              </ul>
            </div>
          </Section>

          {/* 1. Cancelación antes del primer pago */}
          <Section title="1. Cancelación Antes del Primer Pago">
            <p>
              Cuando inicias una reserva, tienes <strong>24 horas</strong> para completar
              el pago de la primera cuota. Durante este período:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[15px]">
              <li>
                Puedes cancelar tu reserva en cualquier momento sin penalidad.
              </li>
              <li>
                Si no completas el pago en 24 horas, la reserva se cancela automáticamente
                sin cargo alguno.
              </li>
              <li>
                Si tu comprobante de pago es rechazado por el administrador, puedes
                intentarlo nuevamente o cancelar sin consecuencias.
              </li>
            </ul>
            <p>
              <strong>En esta etapa no existe obligación contractual y no se aplica
              ninguna política de no devolución.</strong>
            </p>
          </Section>

          {/* 2. Política de no devolución (pedido activo) */}
          <Section title="2. Política de No Devolución (Pedido Activo)">
            <p className="font-semibold text-danger">
              ⚠️ IMPORTANTE: Una vez que tu primer pago ha sido aprobado por el
              administrador, tu pedido se considera ACTIVO y se aplica nuestra
              política de no devolución.
            </p>
            <p>
              Esto significa que:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[15px]">
              <li>
                <strong>No se realizan reembolsos</strong> si decides cancelar tu pedido
                voluntariamente después de que el primer pago fue aprobado.
              </li>
              <li>
                El equipo queda reservado exclusivamente para ti y no puede ser vendido
                a otros clientes.
              </li>
              <li>
                Los pagos realizados cubren los costos de reserva, gestión administrativa
                y operación del sistema de cuotas.
              </li>
              <li>
                Si completas todos los pagos del plan, recibirás tu equipo según lo acordado.
              </li>
            </ul>
          </Section>

          {/* 3. Cancelación por mora (más de 15 días) */}
          <Section title="3. Cancelación Automática por Mora Superior a 15 Días">
            <p>
              Si acumulas <strong>más de 15 días de atraso</strong> en el pago de cualquier
              cuota (a partir de la cuota 2) sin haber cubierto la deuda ni utilizado el
              seguro de prórroga:
            </p>
            <div className="bg-danger/10 border border-danger/30 rounded-lg p-5 my-4">
              <h3 className="font-semibold text-danger mb-3">Consecuencias de la cancelación:</h3>
              <ul className="list-disc list-inside space-y-2 text-[15px]">
                <li>Tu pedido se cancela automáticamente de forma definitiva.</li>
                <li>El equipo NO será entregado.</li>
                <li>
                  <strong>Todos los pagos realizados hasta la fecha quedan en favor de
                  iPhone en Cuotas</strong> como compensación por el período de reserva
                  y los costos operativos incurridos.
                </li>
                <li>No se realizan devoluciones de ningún monto pagado.</li>
                <li>El stock del equipo queda disponible para otros compradores.</li>
              </ul>
            </div>
            <p>
              Para evitar esta situación, puedes:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[15px]">
              <li>Pagar tu cuota antes de que venza (sin penalidad).</li>
              <li>Pagar dentro de los primeros 15 días de atraso (con penalidad según tabla).</li>
              <li>
                Adquirir un <Link href="/terminos#seguro-prorroga" className="text-accent hover:underline">
                  Seguro de Prórroga
                </Link> ANTES de que venza tu cuota para extender el plazo sin penalidades.
              </li>
            </ul>
          </Section>

          {/* 4. Garantía de equipos */}
          <Section title="4. Garantía de los Equipos">
            <p>
              Aunque no realizamos devoluciones de dinero, sí ofrecemos garantías sobre
              los equipos que entregamos:
            </p>
            <div className="space-y-4">
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Equipos Nuevos</h3>
                <p className="text-[15px]">
                  Cuentan con <strong>garantía oficial de Apple por 12 meses</strong> que
                  cubre defectos de fábrica. Puedes hacer uso de la garantía en cualquier
                  Apple Store o centro de servicio autorizado.
                </p>
              </div>
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Equipos Reacondicionados</h3>
                <p className="text-[15px]">
                  Incluyen una <strong>garantía limitada de 3 meses</strong> ofrecida por
                  iPhone en Cuotas que cubre defectos de funcionamiento no provocados por
                  el usuario.
                </p>
              </div>
            </div>
            <p className="text-sm text-text-secondary mt-4">
              <strong>Nota:</strong> Las garantías NO cubren daños físicos, líquidos,
              golpes o uso inadecuado del equipo.
            </p>
          </Section>

          {/* 5. Proceso de reclamación */}
          <Section title="5. ¿Qué Hacer Si Tu Equipo Tiene un Defecto?">
            <p>
              Si recibes tu equipo y presenta un problema de funcionamiento cubierto por
              la garantía, sigue estos pasos:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-[15px]">
              <li>
                Contáctanos inmediatamente por{' '}
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '51944784488'}`}
                  className="text-accent hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
                {' '}dentro del período de garantía.
              </li>
              <li>
                Envía fotos claras del equipo y una descripción detallada del problema.
              </li>
              <li>
                Nuestro equipo evaluará el caso y te indicará los pasos a seguir
                (reparación o reemplazo según aplique).
              </li>
              <li>
                Los costos de envío para gestión de garantía serán evaluados caso por caso.
              </li>
            </ol>
            <p className="text-sm text-text-secondary mt-4">
              El tiempo de respuesta para reclamaciones de garantía es de 24-48 horas hábiles.
            </p>
          </Section>

          {/* 6. Excepciones */}
          <Section title="6. Excepciones y Casos Especiales">
            <p>
              En situaciones excepcionales debidamente justificadas (emergencias médicas,
              fallecimiento, desastres naturales), evaluaremos tu caso de manera individual.
              Contáctanos por WhatsApp con la documentación que respalde tu situación.
            </p>
            <p className="text-sm text-text-secondary">
              Las excepciones son evaluadas caso por caso y no constituyen una obligación
              contractual de reembolso.
            </p>
          </Section>

          {/* 7. Contacto */}
          <Section title="7. ¿Tienes Preguntas?">
            <p>
              Si tienes dudas sobre nuestra política de devoluciones o necesitas asistencia
              con tu pedido:
            </p>
            <div className="bg-bg-secondary border border-border rounded-lg p-5 mt-4">
              <p className="font-semibold mb-2">Contacto:</p>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '51944784488'}`}
                className="text-accent hover:underline text-lg font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp: +51 944 784 488
              </a>
              <p className="text-sm text-text-secondary mt-2">
                Horario de atención: Lunes a domingo, 9:00 AM - 9:00 PM
              </p>
            </div>
          </Section>

          {/* Footer legal */}
          <div className="border-t border-border pt-6 mt-12">
            <p className="text-sm text-text-secondary">
              Al realizar una compra en iPhone en Cuotas, aceptas esta Política de Devoluciones
              junto con nuestros{' '}
              <Link href="/terminos" className="text-accent hover:underline">
                Términos y Condiciones
              </Link>
              . Para más información sobre penalidades por atraso y el Seguro de Prórroga,
              consulta nuestra página de{' '}
              <Link href="/terminos" className="text-accent hover:underline">
                Términos
              </Link>.
            </p>
          </div>

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
