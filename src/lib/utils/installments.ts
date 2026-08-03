/**
 * Utilidades para cálculo de cuotas con interés compuesto mensual
 * Sistema de amortización francesa (cuota fija)
 */

export interface InstallmentCalculation {
  installments: number;
  installmentAmount: number;
  downPayment: number;
  totalWithInterest: number;
  totalInterest: number;
  interestRate: number;
}

/**
 * Calcula el monto de cada cuota usando amortización francesa
 * @param total - Precio total del producto
 * @param rate - Tasa de interés mensual (en porcentaje, ej: 10)
 * @param count - Número total de cuotas
 * @param downPayment - Enganche o cuota inicial
 * @returns Monto de cada cuota mensual
 */
export function calculateInstallmentAmount(
  total: number,
  rate: number,
  count: number,
  downPayment: number = 0
): number {
  if (!total || !count || count <= 0) return 0;

  // Si hay enganche, ese es la primera cuota
  const remainingAmount = downPayment > 0 ? total - downPayment : total;
  const remainingInstallments = downPayment > 0 ? count - 1 : count;

  if (remainingInstallments <= 0) return 0;

  // Sin interés: división simple
  if (rate === 0 || rate === null || rate === undefined) {
    return Math.round((remainingAmount / remainingInstallments) * 100) / 100;
  }

  // Con interés: fórmula francesa
  // Cuota = P × [i × (1+i)^n] / [(1+i)^n - 1]
  const i = rate / 100;
  const n = remainingInstallments;
  const P = remainingAmount;
  const onePlusIToN = Math.pow(1 + i, n);
  const cuota = P * (i * onePlusIToN) / (onePlusIToN - 1);

  return Math.round(cuota * 100) / 100;
}

/**
 * Calcula el detalle completo de un plan de cuotas
 */
export function calculateInstallmentPlan(
  total: number,
  rate: number,
  installments: number,
  downPayment: number = 0
): InstallmentCalculation {
  const installmentAmount = calculateInstallmentAmount(total, rate, installments, downPayment);
  const remainingInstallments = downPayment > 0 ? installments - 1 : installments;
  const totalWithInterest = Math.round(
    (downPayment + installmentAmount * remainingInstallments) * 100
  ) / 100;
  const totalInterest = Math.round((totalWithInterest - total) * 100) / 100;

  return {
    installments,
    installmentAmount,
    downPayment,
    totalWithInterest,
    totalInterest,
    interestRate: rate,
  };
}

/**
 * Genera opciones de cuotas disponibles para un producto
 * @param maxInstallments - Número máximo de cuotas configurado
 * @returns Array de opciones (1, 2, 3, 4, ..., maxInstallments)
 */
export function generateInstallmentOptions(maxInstallments: number): number[] {
  const options: number[] = [1]; // Siempre incluir pago al contado

  // Generar todas las opciones de 2 hasta el máximo
  for (let i = 2; i <= maxInstallments; i++) {
    options.push(i);
  }

  return options;
}
