/**
 * Internationalization (i18n) - Sistema de traducción para variantes
 * Soporta múltiples idiomas y regiones
 */

export type Locale = 'es-PE' | 'en-US' | 'pt-BR';
export type Currency = 'PEN' | 'USD' | 'BRL';

interface ColorTranslation {
  [key: string]: {
    'es-PE': string;
    'en-US': string;
    'pt-BR': string;
  };
}

interface StorageFormat {
  format: (capacity: string) => string;
}

interface CurrencyFormat {
  symbol: string;
  position: 'before' | 'after';
  decimals: number;
  separator: string;
  grouping: string;
}

// Traducciones de colores
const colorTranslations: ColorTranslation = {
  'Negro': {
    'es-PE': 'Negro',
    'en-US': 'Black',
    'pt-BR': 'Preto',
  },
  'Blanco': {
    'es-PE': 'Blanco',
    'en-US': 'White',
    'pt-BR': 'Branco',
  },
  'Azul': {
    'es-PE': 'Azul',
    'en-US': 'Blue',
    'pt-BR': 'Azul',
  },
  'Rojo': {
    'es-PE': 'Rojo',
    'en-US': 'Red',
    'pt-BR': 'Vermelho',
  },
  'Verde': {
    'es-PE': 'Verde',
    'en-US': 'Green',
    'pt-BR': 'Verde',
  },
  'Morado': {
    'es-PE': 'Morado',
    'en-US': 'Purple',
    'pt-BR': 'Roxo',
  },
  'Rosa': {
    'es-PE': 'Rosa',
    'en-US': 'Pink',
    'pt-BR': 'Rosa',
  },
  'Amarillo': {
    'es-PE': 'Amarillo',
    'en-US': 'Yellow',
    'pt-BR': 'Amarelo',
  },
  'Oro': {
    'es-PE': 'Oro',
    'en-US': 'Gold',
    'pt-BR': 'Dourado',
  },
  'Plata': {
    'es-PE': 'Plata',
    'en-US': 'Silver',
    'pt-BR': 'Prata',
  },
  'Titanio Natural': {
    'es-PE': 'Titanio Natural',
    'en-US': 'Natural Titanium',
    'pt-BR': 'Titânio Natural',
  },
  'Titanio Azul': {
    'es-PE': 'Titanio Azul',
    'en-US': 'Blue Titanium',
    'pt-BR': 'Titânio Azul',
  },
  'Titanio Negro': {
    'es-PE': 'Titanio Negro',
    'en-US': 'Black Titanium',
    'pt-BR': 'Titânio Preto',
  },
  'Titanio Blanco': {
    'es-PE': 'Titanio Blanco',
    'en-US': 'White Titanium',
    'pt-BR': 'Titânio Branco',
  },
  'Azul Sierra': {
    'es-PE': 'Azul Sierra',
    'en-US': 'Sierra Blue',
    'pt-BR': 'Azul Sierra',
  },
  'Verde Alpino': {
    'es-PE': 'Verde Alpino',
    'en-US': 'Alpine Green',
    'pt-BR': 'Verde Alpino',
  },
  'Grafito': {
    'es-PE': 'Grafito',
    'en-US': 'Graphite',
    'pt-BR': 'Grafite',
  },
};

// Formatos de almacenamiento por región
const storageFormats: Record<Locale, StorageFormat> = {
  'es-PE': {
    format: (capacity: string) => capacity.replace('GB', ' GB').replace('TB', ' TB'),
  },
  'en-US': {
    format: (capacity: string) => capacity.replace('GB', ' GB').replace('TB', ' TB'),
  },
  'pt-BR': {
    format: (capacity: string) => capacity.replace('GB', ' GB').replace('TB', ' TB'),
  },
};

// Formatos de moneda por región
const currencyFormats: Record<Currency, CurrencyFormat> = {
  PEN: {
    symbol: 'S/',
    position: 'before',
    decimals: 2,
    separator: '.',
    grouping: ',',
  },
  USD: {
    symbol: '$',
    position: 'before',
    decimals: 2,
    separator: '.',
    grouping: ',',
  },
  BRL: {
    symbol: 'R$',
    position: 'before',
    decimals: 2,
    separator: ',',
    grouping: '.',
  },
};

// Mapeo de locale a moneda por defecto
const localeToCurrency: Record<Locale, Currency> = {
  'es-PE': 'PEN',
  'en-US': 'USD',
  'pt-BR': 'BRL',
};

// Tasas de cambio (actualizar dinámicamente en producción)
const exchangeRates: Record<Currency, number> = {
  PEN: 1.0,
  USD: 0.27, // 1 PEN = ~0.27 USD
  BRL: 1.35, // 1 PEN = ~1.35 BRL
};

/**
 * Traduce el nombre de un color al idioma especificado
 */
export function translateColor(color: string, locale: Locale): string {
  const translation = colorTranslations[color];
  if (!translation) return color; // Si no hay traducción, retorna el original
  return translation[locale] || color;
}

/**
 * Formatea la capacidad de almacenamiento según la región
 */
export function formatStorage(capacity: string, locale: Locale): string {
  const formatter = storageFormats[locale];
  return formatter.format(capacity);
}

/**
 * Formatea un precio según la moneda y región
 */
export function formatPrice(
  priceInPEN: number,
  currency: Currency = 'PEN'
): string {
  const format = currencyFormats[currency];
  const rate = exchangeRates[currency];
  const convertedPrice = priceInPEN * rate;

  // Formatear con separadores
  const parts = convertedPrice.toFixed(format.decimals).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, format.grouping);
  const decimalPart = parts[1];

  const formattedNumber = `${integerPart}${format.separator}${decimalPart}`;

  return format.position === 'before'
    ? `${format.symbol} ${formattedNumber}`
    : `${formattedNumber} ${format.symbol}`;
}

/**
 * Obtiene la moneda por defecto para un locale
 */
export function getCurrencyForLocale(locale: Locale): Currency {
  return localeToCurrency[locale];
}

/**
 * Convierte un precio de PEN a otra moneda
 */
export function convertPrice(priceInPEN: number, toCurrency: Currency): number {
  return priceInPEN * exchangeRates[toCurrency];
}

/**
 * Obtiene todos los colores disponibles traducidos
 */
export function getAvailableColors(locale: Locale): Array<{ original: string; translated: string }> {
  return Object.keys(colorTranslations).map(original => ({
    original,
    translated: translateColor(original, locale),
  }));
}

/**
 * Detecta el locale del usuario basado en el navegador
 */
export function detectUserLocale(): Locale {
  if (typeof window === 'undefined') return 'es-PE';

  const browserLocale = navigator.language || 'es-PE';

  if (browserLocale.startsWith('en')) return 'en-US';
  if (browserLocale.startsWith('pt')) return 'pt-BR';
  return 'es-PE'; // Default
}

/**
 * Traducciones de textos comunes de la UI
 */
const uiTranslations = {
  storage: {
    'es-PE': 'Almacenamiento',
    'en-US': 'Storage',
    'pt-BR': 'Armazenamento',
  },
  color: {
    'es-PE': 'Color',
    'en-US': 'Color',
    'pt-BR': 'Cor',
  },
  condition: {
    'es-PE': 'Condición',
    'en-US': 'Condition',
    'pt-BR': 'Condição',
  },
  new: {
    'es-PE': 'Nuevo',
    'en-US': 'New',
    'pt-BR': 'Novo',
  },
  refurbished: {
    'es-PE': 'Reacondicionado',
    'en-US': 'Refurbished',
    'pt-BR': 'Recondicionado',
  },
  available: {
    'es-PE': 'Disponible',
    'en-US': 'Available',
    'pt-BR': 'Disponível',
  },
  outOfStock: {
    'es-PE': 'Sin stock',
    'en-US': 'Out of stock',
    'pt-BR': 'Sem estoque',
  },
  price: {
    'es-PE': 'Precio',
    'en-US': 'Price',
    'pt-BR': 'Preço',
  },
  compareVariants: {
    'es-PE': 'Comparar variantes',
    'en-US': 'Compare variants',
    'pt-BR': 'Comparar variantes',
  },
  selectVariant: {
    'es-PE': 'Selecciona tu variante',
    'en-US': 'Select your variant',
    'pt-BR': 'Selecione sua variante',
  },
};

export function t(key: keyof typeof uiTranslations, locale: Locale): string {
  return uiTranslations[key][locale] || uiTranslations[key]['es-PE'];
}

/**
 * Hook personalizado para i18n (para usar en componentes)
 */
export function useI18n() {
  // En una implementación real, esto vendría de un Context o estado global
  const locale: Locale = 'es-PE'; // Default, se puede cambiar dinámicamente

  return {
    locale,
    translateColor: (color: string) => translateColor(color, locale),
    formatStorage: (capacity: string) => formatStorage(capacity, locale),
    formatPrice: (price: number, currency?: Currency) => formatPrice(price, currency || getCurrencyForLocale(locale)),
    t: (key: keyof typeof uiTranslations) => t(key, locale),
  };
}
