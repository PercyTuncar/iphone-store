/**
 * Navigation products helper
 * Provides a list of published products for navigation menus (Navbar, Footer, BottomTabBar)
 * Returns only slug and label to minimize data transfer
 */

import { getAllPublishedProducts } from '@/lib/firebase/products';

export interface NavProduct {
  label: string;
  slug: string;
}

/**
 * Get products for navigation menus
 * Returns published products sorted by model relevance (newest/pro models first)
 * Cached for 1 hour to reduce Firestore reads
 */
export async function getNavigationProducts(): Promise<NavProduct[]> {
  try {
    const products = await getAllPublishedProducts();

    // Transform to navigation format
    const navProducts: NavProduct[] = products.map((p) => ({
      label: p.title,
      slug: p.slug,
    }));

    // Sort by model priority (Pro Max > Pro > regular, newer > older)
    // This ensures the most important models appear first in navigation
    const modelPriority: Record<string, number> = {
      '17 Pro Max': 10,
      '17 Pro': 9,
      '16 Pro Max': 8,
      '16 Pro': 7,
      '15 Pro Max': 6,
      '15 Pro': 5,
      '15': 4,
      '14 Pro Max': 3,
      '14': 2,
      '13': 1,
    };

    navProducts.sort((a, b) => {
      const priorityA = Object.entries(modelPriority).find(([key]) =>
        a.label.toLowerCase().includes(key.toLowerCase())
      )?.[1] ?? 0;

      const priorityB = Object.entries(modelPriority).find(([key]) =>
        b.label.toLowerCase().includes(key.toLowerCase())
      )?.[1] ?? 0;

      return priorityB - priorityA;
    });

    return navProducts;
  } catch (error) {
    console.error('[getNavigationProducts] Error fetching products:', error);
    // Return empty array on error - graceful degradation
    // Navigation will simply not show product links if Firestore is unavailable
    return [];
  }
}
