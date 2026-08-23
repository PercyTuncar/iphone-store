/**
 * Generador de SKU secuencial para productos
 * Formato: PROD-000001, PROD-000002, etc.
 */

import { getFirestore, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './config';

/**
 * Genera el siguiente SKU secuencial para un producto
 * @returns Promise<string> Ej: "PROD-000042"
 */
export async function generateNextProductSKU(): Promise<string> {
  try {
    // Obtener el último producto creado (ordenado por createdAt descendente)
    const q = query(
      collection(db, 'products'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Primer producto
      return 'PROD-000001';
    }

    const lastProduct = snapshot.docs[0].data();
    const lastSKU = lastProduct.sku as string;

    // Extraer el número del SKU anterior
    const match = lastSKU.match(/PROD-(\d+)/);

    if (!match) {
      // Si el SKU no tiene el formato esperado, empezar desde 1
      return 'PROD-000001';
    }

    const lastNumber = parseInt(match[1], 10);
    const nextNumber = lastNumber + 1;

    // Formatear con 6 dígitos (000001, 000002, etc.)
    const formattedNumber = nextNumber.toString().padStart(6, '0');

    return `PROD-${formattedNumber}`;
  } catch (error) {
    console.error('Error generating SKU:', error);
    // Fallback: usar timestamp para evitar colisiones
    const timestamp = Date.now();
    return `PROD-${timestamp.toString().slice(-6)}`;
  }
}

/**
 * Genera SKU para una variante específica
 * @param masterSKU SKU del producto maestro (ej: "PROD-000001")
 * @param variantIndex Índice de la variante (0, 1, 2...)
 * @returns string Ej: "PROD-000001-V01"
 */
export function generateVariantSKU(masterSKU: string, variantIndex: number): string {
  const variantNumber = (variantIndex + 1).toString().padStart(2, '0');
  return `${masterSKU}-V${variantNumber}`;
}

/**
 * Genera SKU para variante con descriptor
 * @param masterSKU SKU del producto maestro
 * @param storage Capacidad (ej: "128GB")
 * @param color Color (ej: "Negro Titanio")
 * @returns string Ej: "PROD-000001-128GB-NEGRO"
 */
export function generateDescriptiveVariantSKU(
  masterSKU: string,
  storage: string,
  color: string
): string {
  const storageClean = storage.replace(/\s/g, '').toUpperCase();
  const colorClean = color
    .split(' ')[0] // Tomar solo la primera palabra del color
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, ''); // Quitar acentos

  return `${masterSKU}-${storageClean}-${colorClean}`;
}
