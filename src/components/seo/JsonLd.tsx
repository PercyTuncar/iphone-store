/**
 * JsonLd — injects a JSON-LD script tag into the <head>.
 * Used as a Server Component inside page.tsx files.
 *
 * Usage:
 *   <JsonLd data={buildProductSchema(product, reviews)} />
 */

interface JsonLdProps {
  data: object;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: intentional — JSON-LD schema
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data, null, 0) }}
    />
  );
}
