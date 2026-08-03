/**
 * Client-side metadata component for pages that need noindex
 * Use this in client components that can't export metadata directly
 */

'use client';

import { useEffect } from 'react';

interface ClientMetadataProps {
  title?: string;
  description?: string;
  noindex?: boolean;
}

export function ClientMetadata({ title, description, noindex = false }: ClientMetadataProps) {
  useEffect(() => {
    if (title) {
      document.title = `${title} | iPhone en Cuotas`;
    }

    // Add or update meta description
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);
    }

    // Add or update robots meta
    if (noindex) {
      let metaRobots = document.querySelector('meta[name="robots"]');
      if (!metaRobots) {
        metaRobots = document.createElement('meta');
        metaRobots.setAttribute('name', 'robots');
        document.head.appendChild(metaRobots);
      }
      metaRobots.setAttribute('content', 'noindex, nofollow');
    }
  }, [title, description, noindex]);

  return null;
}
