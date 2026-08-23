/**
 * Google Merchant Center Product Feed
 * Endpoint: /api/merchant-feed
 *
 * Genera un feed XML compatible con Google Shopping (RSS 2.0 + g: namespace)
 * Sección 3.3 del PRD - Estructura EXACTA según especificación
 *
 * IMPORTANTE: Este feed debe ser registrado en Google Merchant Center
 * como "Scheduled fetch" apuntando a: https://www.iphoneencuotas.com/api/merchant-feed
 */

import { NextResponse } from 'next/server';
import { getAllPublishedProducts } from '@/lib/firebase/products';
import { getStorePolicy } from '@/lib/firebase/settings';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.iphoneencuotas.com';

export const revalidate = 3600; // Regenerar cada hora (Sección 3.4 - mínimo diario)

export async function GET() {
  try {
    // Obtener todos los productos publicados y políticas de tienda
    const [allProducts, policy] = await Promise.all([
      getAllPublishedProducts(),
      getStorePolicy(),
    ]);

    // Generar XML del feed con soporte de variantes
    const xml = await generateMerchantFeedXML(allProducts, policy);

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error('[merchant-feed] Error:', error);
    return new NextResponse('Error generating feed', { status: 500 });
  }
}

async function generateMerchantFeedXML(products: any[], policy: any): Promise<string> {
  const items: string[] = [];

  // Importar función para obtener variantes
  const { getAllVariantsByMasterId } = await import('@/lib/firebase/products');

  for (const product of products) {
    // Si es una variante, se ignora (ya se procesó con su maestro)
    if (product.isVariant) continue;

    // Verificar si tiene variantes
    const variants = await getAllVariantsByMasterId(product.id).catch(() => []);

    if (variants.length > 0) {
      // Es un maestro con variantes: enviar SOLO las variantes con URLs únicas
      for (const variant of variants) {
        if (variant.status === 'published') {
          items.push(generateVariantItem(variant, product.productGroupId, product.slug, policy));
        }
      }
    } else {
      // Producto tradicional sin variantes: enviar normalmente
      items.push(generateProductItem(product, policy));
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>iPhone en Cuotas</title>
    <link>${SITE_URL}</link>
    <description>Catálogo de iPhones en cuotas en Perú</description>
${items.join('\n')}
  </channel>
</rss>`;
}

function generateProductItem(product: any, policy: any): string {
  const availability = product.stock > 0 ? 'in_stock' : 'out_of_stock';
  const condition = product.condition === 'new' ? 'new' : 'refurbished';

  // Validar que las imágenes sean del propio dominio (Bug #2)
  const validImages = (product.images || []).filter(
    (img: string) => img.includes('firebasestorage.googleapis.com') || img.includes('storage.googleapis.com')
  );

  const mainImage = validImages[0] || product.thumbnailUrl;
  const additionalImages = validImages.slice(1, 11); // Máximo 10 imágenes adicionales

  // SKU: usar el campo sku si existe, sino usar id como fallback
  const sku = product.sku || product.id;

  // Usar seo.metaTitle si existe (recomendado), sino title
  const feedTitle = product.seo?.metaTitle || product.title;
  const feedDescription = product.seo?.metaDescription || product.title;

  return `    <item>
      <g:id>${escapeXml(sku)}</g:id>
      <g:title>${escapeXml(feedTitle)}</g:title>
      <g:description>${escapeXml(feedDescription)}</g:description>
      <g:link>${SITE_URL}/${product.slug}</g:link>
      <g:image_link>${escapeXml(mainImage)}</g:image_link>
${additionalImages.map((img: string) => `      <g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`).join('\n')}
      <g:availability>${availability}</g:availability>
      <g:price>${product.priceTotal.toFixed(2)} PEN</g:price>
      <g:condition>${condition}</g:condition>
      <g:brand>Apple</g:brand>
${product.gtin ? `      <g:gtin>${escapeXml(product.gtin)}</g:gtin>` : ''}
${product.mpn ? `      <g:mpn>${escapeXml(product.mpn)}</g:mpn>` : ''}
      <g:google_product_category>${product.googleProductCategoryId || '267'}</g:google_product_category>
      <g:product_type>${escapeXml(product.category || 'Celulares y Smartphones > iPhone')}</g:product_type>
      <g:item_group_id>${escapeXml(product.productGroupId || product.model)}</g:item_group_id>
${generateShippingXML(policy)}
${generateInstallmentXML(product)}
    </item>`;
}

function generateShippingXML(policy: any): string {
  if (!policy || !policy.shipping) {
    // Default shipping para Perú si no está configurado
    return `      <g:shipping>
        <g:country>PE</g:country>
        <g:price>20.00 PEN</g:price>
      </g:shipping>`;
  }

  return `      <g:shipping>
        <g:country>${policy.shipping.addressCountry}</g:country>
        <g:price>${policy.shipping.ratePEN.toFixed(2)} PEN</g:price>
      </g:shipping>`;
}

function generateInstallmentXML(product: any): string {
  if (!product.installments || !product.installmentAmount) {
    return '';
  }

  // Atributo de cuotas (Sección 3.3 del PRD)
  // IMPORTANTE: months y amount son OBLIGATORIOS, downpayment es opcional
  const downPayment = product.downPayment || 0;

  return `      <g:installment>
        <g:months>${product.installments}</g:months>
        <g:amount>${product.installmentAmount.toFixed(2)} PEN</g:amount>
${downPayment > 0 ? `        <g:downpayment>${downPayment.toFixed(2)} PEN</g:downpayment>` : ''}
      </g:installment>`;
}

function escapeXml(text: string | null | undefined): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Genera un item XML para una VARIANTE de producto
 * Cada variante se envía con URL única usando ?variant=ID
 */
function generateVariantItem(variant: any, groupId: string, masterSlug: string, policy: any): string {
  const sku = variant.sku || variant.id;

  // Título específico que incluye todas las características
  const title = `${variant.model} ${variant.storage} ${variant.color}${
    variant.condition === 'refurbished'
      ? ` Reacondicionado Grado ${variant.grade}`
      : ' Nuevo'
  }${variant.batteryHealth ? ` Batería ${variant.batteryHealth}%` : ''}`;

  // URL con parámetro de variante para que Google pueda indexar cada una
  const link = `${SITE_URL}/${masterSlug}?variant=${variant.id}`;

  // Descripción específica para la variante
  const description = variant.seo?.metaDescription ||
    `${title}. Paga en ${variant.installments} cuotas de S/ ${variant.installmentAmount.toFixed(2)}. Stock disponible. Envío a todo Perú.`;

  return `    <item>
      <g:id>${escapeXml(sku)}</g:id>
      <g:title>${escapeXml(title)}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:link>${link}</g:link>
      <g:image_link>${escapeXml(variant.thumbnailUrl)}</g:image_link>
      <g:availability>${variant.stock > 0 ? 'in_stock' : 'out_of_stock'}</g:availability>
      <g:price>${variant.priceTotal.toFixed(2)} PEN</g:price>
      <g:condition>${variant.condition === 'new' ? 'new' : 'refurbished'}</g:condition>
      <g:brand>Apple</g:brand>
      <g:gtin>${escapeXml(variant.gtin || '')}</g:gtin>
      <g:mpn>${escapeXml(variant.mpn || sku)}</g:mpn>
      <g:item_group_id>${escapeXml(groupId)}</g:item_group_id>
      <g:color>${escapeXml(variant.color)}</g:color>
      <g:size>${escapeXml(variant.storage)}</g:size>
${variant.batteryHealth ? `      <g:custom_label_0>Batería ${variant.batteryHealth}%</g:custom_label_0>\n` : ''}${variant.condition === 'refurbished' && variant.grade ? `      <g:custom_label_1>Grado ${variant.grade}</g:custom_label_1>\n` : ''}      <g:google_product_category>${variant.googleProductCategoryId || '267'}</g:google_product_category>
      <g:product_type>${escapeXml(variant.category || 'Celulares y Smartphones > iPhone')}</g:product_type>
${generateShippingXML(policy)}
${generateInstallmentXML(variant)}
    </item>`;
}
