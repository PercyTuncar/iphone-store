/**
 * Script para verificar el SEO y structured data después del deploy
 * Uso: npx tsx scripts/verify-seo.ts
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.iphoneencuotas.com';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  url?: string;
}

const results: CheckResult[] = [];

async function checkUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    throw new Error(`Failed to fetch ${url}: ${error}`);
  }
}

function extractJsonLd(html: string): any[] {
  const regex = /<script type="application\/ld\+json">(.*?)<\/script>/gs;
  const matches = [...html.matchAll(regex)];
  return matches.map(match => {
    try {
      return JSON.parse(match[1]);
    } catch {
      return null;
    }
  }).filter(Boolean);
}

async function checkRobotsTxt() {
  console.log('\n📄 Verificando robots.txt...');
  try {
    const content = await checkUrl(`${SITE_URL}/robots.txt`);

    if (content.includes('Sitemap:')) {
      results.push({ name: 'robots.txt', status: 'pass', message: 'Contiene referencia al sitemap' });
    } else {
      results.push({ name: 'robots.txt', status: 'warning', message: 'No contiene referencia al sitemap' });
    }

    if (content.includes('Disallow: /iphone') || content.includes('Disallow: *')) {
      results.push({ name: 'robots.txt - Productos', status: 'fail', message: '¡CRÍTICO! Las páginas de productos están bloqueadas' });
    } else {
      results.push({ name: 'robots.txt - Productos', status: 'pass', message: 'Productos permitidos para crawling' });
    }
  } catch (error) {
    results.push({ name: 'robots.txt', status: 'fail', message: `Error: ${error}` });
  }
}

async function checkSitemap() {
  console.log('\n🗺️  Verificando sitemap.xml...');
  try {
    const content = await checkUrl(`${SITE_URL}/sitemap.xml`);

    // Count URLs
    const urlCount = (content.match(/<loc>/g) || []).length;

    if (urlCount === 0) {
      results.push({ name: 'sitemap.xml', status: 'fail', message: 'No contiene URLs' });
    } else if (urlCount < 5) {
      results.push({ name: 'sitemap.xml', status: 'warning', message: `Solo contiene ${urlCount} URLs (muy pocas)` });
    } else {
      results.push({ name: 'sitemap.xml', status: 'pass', message: `Contiene ${urlCount} URLs` });
    }

    // Check if product pages are included
    if (content.includes('/iphone/iphone-')) {
      results.push({ name: 'sitemap.xml - Productos', status: 'pass', message: 'Incluye páginas de productos' });
    } else {
      results.push({ name: 'sitemap.xml - Productos', status: 'fail', message: '¡No incluye páginas de productos!' });
    }
  } catch (error) {
    results.push({ name: 'sitemap.xml', status: 'fail', message: `Error: ${error}` });
  }
}

async function checkProductPage(slug: string) {
  console.log(`\n🔍 Verificando página de producto: ${slug}...`);
  const url = `${SITE_URL}/iphone/${slug}`;

  try {
    const html = await checkUrl(url);

    // Check meta tags
    if (html.includes('<link rel="canonical"')) {
      results.push({ name: `${slug} - Canonical`, status: 'pass', message: 'Tag canonical presente', url });
    } else {
      results.push({ name: `${slug} - Canonical`, status: 'fail', message: 'Tag canonical faltante', url });
    }

    if (html.includes('name="robots"') && html.includes('noindex')) {
      results.push({ name: `${slug} - Robots`, status: 'fail', message: '¡CRÍTICO! Página marcada como noindex', url });
    } else {
      results.push({ name: `${slug} - Robots`, status: 'pass', message: 'Indexable', url });
    }

    // Extract and validate JSON-LD
    const schemas = extractJsonLd(html);

    if (schemas.length === 0) {
      results.push({ name: `${slug} - Schema`, status: 'fail', message: 'No se encontró JSON-LD', url });
      return;
    }

    // Find Product schema
    const productSchema = schemas.find(s => s['@type'] === 'Product');

    if (!productSchema) {
      results.push({ name: `${slug} - Product Schema`, status: 'fail', message: 'No se encontró schema de Product', url });
      return;
    }

    // Validate required fields
    const requiredFields = ['name', 'description', 'image', 'offers', 'brand'];
    const missingFields = requiredFields.filter(field => !productSchema[field]);

    if (missingFields.length > 0) {
      results.push({
        name: `${slug} - Product Schema`,
        status: 'fail',
        message: `Faltan campos requeridos: ${missingFields.join(', ')}`,
        url
      });
    } else {
      results.push({ name: `${slug} - Product Schema`, status: 'pass', message: 'Campos requeridos presentes', url });
    }

    // Validate Merchant Listing fields
    const offers = productSchema.offers;
    if (!offers) {
      results.push({ name: `${slug} - Offers`, status: 'fail', message: 'Falta objeto offers', url });
      return;
    }

    const merchantFields = {
      'availability': offers.availability,
      'shippingDetails': offers.shippingDetails,
      'hasMerchantReturnPolicy': offers.hasMerchantReturnPolicy,
    };

    const missingMerchantFields = Object.entries(merchantFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingMerchantFields.length > 0) {
      results.push({
        name: `${slug} - Merchant Listing`,
        status: 'warning',
        message: `Faltan campos recomendados: ${missingMerchantFields.join(', ')}`,
        url
      });
    } else {
      results.push({
        name: `${slug} - Merchant Listing`,
        status: 'pass',
        message: '✅ Todos los campos de Merchant Listing presentes (availability, shippingDetails, hasMerchantReturnPolicy)',
        url
      });
    }

    // Check for BreadcrumbList
    const breadcrumbSchema = schemas.find(s => s['@type'] === 'BreadcrumbList');
    if (breadcrumbSchema) {
      results.push({ name: `${slug} - Breadcrumb`, status: 'pass', message: 'Breadcrumb schema presente', url });
    } else {
      results.push({ name: `${slug} - Breadcrumb`, status: 'warning', message: 'Breadcrumb schema faltante', url });
    }

  } catch (error) {
    results.push({ name: `${slug} - Error`, status: 'fail', message: `Error al verificar: ${error}`, url });
  }
}

async function checkHomePage() {
  console.log('\n🏠 Verificando página de inicio...');
  const url = SITE_URL;

  try {
    const html = await checkUrl(url);
    const schemas = extractJsonLd(html);

    // Check for Organization schema
    const orgSchema = schemas.find(s => s['@type'] === 'Organization');
    if (orgSchema) {
      results.push({ name: 'Home - Organization', status: 'pass', message: 'Organization schema presente', url });

      // Check for policies in Organization
      if (orgSchema.hasMerchantReturnPolicy) {
        results.push({ name: 'Home - Return Policy', status: 'pass', message: '✅ Política de devoluciones en Organization', url });
      } else {
        results.push({ name: 'Home - Return Policy', status: 'fail', message: 'Falta hasMerchantReturnPolicy en Organization', url });
      }

      if (orgSchema.shippingDetails) {
        results.push({ name: 'Home - Shipping Details', status: 'pass', message: '✅ Detalles de envío en Organization', url });
      } else {
        results.push({ name: 'Home - Shipping Details', status: 'fail', message: 'Falta shippingDetails en Organization', url });
      }
    } else {
      results.push({ name: 'Home - Organization', status: 'warning', message: 'Organization schema faltante', url });
    }

    // Check for WebSite schema
    const websiteSchema = schemas.find(s => s['@type'] === 'WebSite');
    if (websiteSchema) {
      results.push({ name: 'Home - WebSite', status: 'pass', message: 'WebSite schema presente', url });
    }
  } catch (error) {
    results.push({ name: 'Home - Error', status: 'fail', message: `Error: ${error}`, url });
  }
}

function printResults() {
  console.log('\n\n═══════════════════════════════════════════════════════');
  console.log('📊 RESULTADOS DE VERIFICACIÓN SEO');
  console.log('═══════════════════════════════════════════════════════\n');

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warnings = results.filter(r => r.status === 'warning').length;

  results.forEach(result => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${result.name}`);
    console.log(`   ${result.message}`);
    if (result.url) {
      console.log(`   🔗 ${result.url}`);
    }
    console.log('');
  });

  console.log('═══════════════════════════════════════════════════════');
  console.log(`✅ Pasadas: ${passed}`);
  console.log(`⚠️  Advertencias: ${warnings}`);
  console.log(`❌ Fallidas: ${failed}`);
  console.log('═══════════════════════════════════════════════════════\n');

  if (failed > 0) {
    console.log('❌ HAY PROBLEMAS CRÍTICOS QUE DEBEN CORREGIRSE\n');
    process.exit(1);
  } else if (warnings > 0) {
    console.log('⚠️  Todo funciona pero hay advertencias a revisar\n');
    process.exit(0);
  } else {
    console.log('🎉 ¡TODO PERFECTO! El SEO está correctamente implementado\n');
    process.exit(0);
  }
}

async function main() {
  console.log('🚀 Iniciando verificación de SEO...');
  console.log(`🌐 Sitio: ${SITE_URL}\n`);

  await checkRobotsTxt();
  await checkSitemap();
  await checkHomePage();

  // Check some product pages
  const productSlugs = ['iphone-15-pro', 'iphone-16-pro'];
  for (const slug of productSlugs) {
    await checkProductPage(slug);
  }

  printResults();
}

main().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
