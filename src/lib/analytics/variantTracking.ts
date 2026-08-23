/**
 * Variant Tracking - Sistema de analytics para variantes de productos
 * Rastrea vistas, interacciones y conversiones por variante
 */

import { db } from '@/lib/firebase/config';
import { collection, addDoc, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';

export interface VariantEvent {
  variantId: string;
  masterProductId: string;
  eventType: 'view' | 'interaction' | 'conversion' | 'add_to_cart' | 'comparison';
  storage?: string;
  color?: string;
  price?: number;
  sessionId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface VariantAnalytics {
  variantId: string;
  views: number;
  interactions: number;
  conversions: number;
  conversionRate: number;
  averageTimeOnVariant?: number;
}

const ANALYTICS_COLLECTION = 'variant_analytics';

// Genera un ID de sesión único por usuario
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';

  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Rastrea cuando un usuario ve una variante
 */
export async function trackVariantView(
  variantId: string,
  masterProductId: string,
  metadata?: Record<string, any>
) {
  try {
    const event: VariantEvent = {
      variantId,
      masterProductId,
      eventType: 'view',
      sessionId: getSessionId(),
      timestamp: new Date(),
      metadata,
    };

    await addDoc(collection(db, ANALYTICS_COLLECTION), {
      ...event,
      timestamp: Timestamp.fromDate(event.timestamp),
    });
  } catch (error) {
    console.error('[trackVariantView] Error:', error);
  }
}

/**
 * Rastrea cuando un usuario interactúa con una variante
 * (selecciona almacenamiento, color, etc.)
 */
export async function trackVariantInteraction(
  variantId: string,
  masterProductId: string,
  interactionType: string,
  metadata?: Record<string, any>
) {
  try {
    const event: VariantEvent = {
      variantId,
      masterProductId,
      eventType: 'interaction',
      sessionId: getSessionId(),
      timestamp: new Date(),
      metadata: {
        ...metadata,
        interactionType,
      },
    };

    await addDoc(collection(db, ANALYTICS_COLLECTION), {
      ...event,
      timestamp: Timestamp.fromDate(event.timestamp),
    });
  } catch (error) {
    console.error('[trackVariantInteraction] Error:', error);
  }
}

/**
 * Rastrea cuando un usuario convierte (reserva) una variante
 */
export async function trackVariantConversion(
  variantId: string,
  masterProductId: string,
  price: number,
  metadata?: Record<string, any>
) {
  try {
    const event: VariantEvent = {
      variantId,
      masterProductId,
      eventType: 'conversion',
      price,
      sessionId: getSessionId(),
      timestamp: new Date(),
      metadata,
    };

    await addDoc(collection(db, ANALYTICS_COLLECTION), {
      ...event,
      timestamp: Timestamp.fromDate(event.timestamp),
    });
  } catch (error) {
    console.error('[trackVariantConversion] Error:', error);
  }
}

/**
 * Rastrea cuando un usuario compara variantes
 */
export async function trackVariantComparison(
  variantIds: string[],
  masterProductId: string,
  metadata?: Record<string, any>
) {
  try {
    for (const variantId of variantIds) {
      const event: VariantEvent = {
        variantId,
        masterProductId,
        eventType: 'comparison',
        sessionId: getSessionId(),
        timestamp: new Date(),
        metadata: {
          ...metadata,
          comparedWith: variantIds.filter(id => id !== variantId),
        },
      };

      await addDoc(collection(db, ANALYTICS_COLLECTION), {
        ...event,
        timestamp: Timestamp.fromDate(event.timestamp),
      });
    }
  } catch (error) {
    console.error('[trackVariantComparison] Error:', error);
  }
}

/**
 * Obtiene analytics de una variante específica
 */
export async function getVariantAnalytics(
  variantId: string,
  dateFrom?: Date,
  dateTo?: Date
): Promise<VariantAnalytics> {
  try {
    const constraints = [where('variantId', '==', variantId)];

    if (dateFrom) {
      constraints.push(where('timestamp', '>=', Timestamp.fromDate(dateFrom)));
    }
    if (dateTo) {
      constraints.push(where('timestamp', '<=', Timestamp.fromDate(dateTo)));
    }

    const q = query(collection(db, ANALYTICS_COLLECTION), ...constraints);
    const snapshot = await getDocs(q);

    let views = 0;
    let interactions = 0;
    let conversions = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.eventType === 'view') views++;
      if (data.eventType === 'interaction') interactions++;
      if (data.eventType === 'conversion') conversions++;
    });

    const conversionRate = views > 0 ? (conversions / views) * 100 : 0;

    return {
      variantId,
      views,
      interactions,
      conversions,
      conversionRate,
    };
  } catch (error) {
    console.error('[getVariantAnalytics] Error:', error);
    return {
      variantId,
      views: 0,
      interactions: 0,
      conversions: 0,
      conversionRate: 0,
    };
  }
}

/**
 * Obtiene las variantes más vistas de un producto maestro
 */
export async function getTopVariants(
  masterProductId: string,
  limitCount: number = 10
): Promise<Array<{ variantId: string; viewCount: number }>> {
  try {
    const q = query(
      collection(db, ANALYTICS_COLLECTION),
      where('masterProductId', '==', masterProductId),
      where('eventType', '==', 'view'),
      orderBy('timestamp', 'desc'),
      limit(1000)
    );

    const snapshot = await getDocs(q);
    const variantCounts = new Map<string, number>();

    snapshot.forEach(doc => {
      const data = doc.data();
      const count = variantCounts.get(data.variantId) || 0;
      variantCounts.set(data.variantId, count + 1);
    });

    const sorted = Array.from(variantCounts.entries())
      .map(([variantId, viewCount]) => ({ variantId, viewCount }))
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, limitCount);

    return sorted;
  } catch (error) {
    console.error('[getTopVariants] Error:', error);
    return [];
  }
}

/**
 * Obtiene el heat map de interacciones
 * Retorna un mapa de storage x color con conteo de interacciones
 */
export async function getVariantHeatmap(
  masterProductId: string,
  dateFrom?: Date,
  dateTo?: Date
): Promise<Record<string, number>> {
  try {
    const constraints = [
      where('masterProductId', '==', masterProductId),
      where('eventType', '==', 'interaction'),
    ];

    if (dateFrom) {
      constraints.push(where('timestamp', '>=', Timestamp.fromDate(dateFrom)));
    }
    if (dateTo) {
      constraints.push(where('timestamp', '<=', Timestamp.fromDate(dateTo)));
    }

    const q = query(collection(db, ANALYTICS_COLLECTION), ...constraints);
    const snapshot = await getDocs(q);

    const heatmap: Record<string, number> = {};

    snapshot.forEach(doc => {
      const data = doc.data();
      const storage = data.metadata?.storage || 'unknown';
      const color = data.metadata?.color || 'unknown';
      const key = `${storage}_${color}`;
      heatmap[key] = (heatmap[key] || 0) + 1;
    });

    return heatmap;
  } catch (error) {
    console.error('[getVariantHeatmap] Error:', error);
    return {};
  }
}
