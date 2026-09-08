/**
 * Utilidades para cálculo de precios y visualización
 */

import { calculateInstallmentAmount } from './installments';

/**
 * Calcula el precio más atractivo para mostrar en las tarjetas de productos
 * Prioridad:
 * 1. Si hay downPayment (reserva inicial), muestra ese monto
 * 2. Si no hay downPayment, muestra el monto de la cuota más baja posible (precio total / número de cuotas)
 *
 * @param priceTotal - Precio total del producto
 * @param installments - Número de cuotas configuradas
 * @param interestRate - Tasa de interés mensual (porcentaje)
 * @param downPayment - Pago inicial/reserva (0 si no hay)
 * @returns El monto más atractivo para mostrar como "gancho"
 */
export function calculateDisplayPrice(
  priceTotal: number,
  installments: number,
  interestRate: number,
  downPayment: number
): number {
  // Si hay downPayment, ese es el precio más atractivo (lo que pagas para reservar)
  if (downPayment > 0) {
    return downPayment;
  }

  // Si no hay downPayment, calculamos la cuota mensual más baja
  // (que es cuando se divide en el máximo de cuotas)
  return calculateInstallmentAmount(priceTotal, interestRate, installments, 0);
}

/**
 * Genera el texto descriptivo para el precio mostrado
 *
 * @param downPayment - Pago inicial/reserva (0 si no hay)
 * @param installments - Número de cuotas configuradas
 * @returns Texto descriptivo (ej: "Reserva inicial" o "12 cuotas de")
 */
export function getDisplayPriceLabel(
  downPayment: number,
  installments: number
): string {
  if (downPayment > 0) {
    return 'Reserva inicial';
  }

  return `${installments} cuotas de`;
}

/**
 * Verifica si el precio mostrado es la reserva inicial o la cuota
 *
 * @param downPayment - Pago inicial/reserva (0 si no hay)
 * @returns true si es reserva inicial, false si es cuota
 */
export function isDisplayPriceDownPayment(downPayment: number): boolean {
  return downPayment > 0;
}
