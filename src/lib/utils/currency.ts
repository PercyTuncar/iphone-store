/**
 * Currency formatting helpers
 */

/**
 * Format a number as Peruvian Soles.
 * formatSoles(150.5)  → "S/ 150.50"
 * formatSoles(2100)   → "S/ 2,100.00"
 */
export function formatSoles(amount: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(amount)
    .replace('PEN', 'S/') // Intl uses "PEN" — replace with "S/"
    .trim();
}

/**
 * Format a number as Soles without decimals (for large amounts like priceTotal).
 * formatSolesShort(2100) → "S/ 2,100"
 */
export function formatSolesShort(amount: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace('PEN', 'S/')
    .trim();
}

/**
 * Calculate the installment amount given a principal, interest rate, and number of installments.
 * installmentAmount(2100, 0.05, 12) → 185 (approx)
 */
export function calcInstallmentAmount(
  principal: number,
  interestRate: number,
  installments: number
): number {
  if (interestRate === 0) return Math.ceil(principal / installments);
  const total = principal * (1 + interestRate * installments);
  return Math.ceil(total / installments);
}
