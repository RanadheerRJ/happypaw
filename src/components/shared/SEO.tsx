import { Helmet } from 'react-helmet-async';
import { brand } from '@/config/brand';
import { env } from '@/config/env';

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const defaultDescription = brand.description;

export function SEO({
  title,
  description = defaultDescription,
  path = '/',
  image = brand.ogImagePath,
  noIndex,
  jsonLd,
}: SEOProps) {
  const fullTitle = title ? `${title} · ${brand.name}` : `${brand.name} — ${brand.tagline}`;
  const canonical = `${brand.domain}${path === '/' ? '' : path}`;
  const imageUrl = image.startsWith('http') ? image : `${brand.domain}/${image.replace(/^\//, '')}`;
  const shouldNoIndex = noIndex ?? env.demoMode;
  const jsonLdBlocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {shouldNoIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={brand.name} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:locale" content="en_IN" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {jsonLdBlocks.map((block, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(block)}
        </script>
      ))}
    </Helmet>
  );
}
