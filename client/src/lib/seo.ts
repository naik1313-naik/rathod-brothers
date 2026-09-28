/**
 * SEO helpers.
 *
 * The full, crawlable metadata lives statically in index.html so search engines
 * see it without executing JavaScript. This module only exists to adjust the
 * document head on client-side route changes (mainly to `noindex` the admin
 * area) and to emit the LocalBusiness JSON-LD.
 */
import { business } from './business';

const SITE_URL = business.websiteUrl;

function upsertMeta(selector: string, attribute: 'name' | 'property', key: string, content: string): void {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertLink(rel: string, href: string): void {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

export function setDocumentTitle(title: string): void {
  document.title = title;
}

/** Keeps the canonical URL in step with the current route. */
export function setCanonical(path: string): void {
  upsertLink('canonical', `${SITE_URL}${path}`);
}

/**
 * Admin pages must never be indexed, and should not be followed into.
 * Everything else is indexable, followable.
 */
export function setRobots(index: boolean): void {
  upsertMeta('meta[name="robots"]', 'name', 'robots', index ? 'index, follow' : 'noindex, nofollow');
}

export interface PageMeta {
  title: string;
  description: string;
  path: string;
  /** Admin and utility pages are noindexed. */
  index?: boolean;
}

/**
 * LocalBusiness structured data.
 *
 * Only facts we actually know are included. There is deliberately no
 * aggregateRating, no review count, no `numberOfEmployees` and no founding
 * date, because none of those have been provided — inventing them would be
 * both inaccurate and a structured-data policy violation.
 */
export function localBusinessJsonLd(): string {
  const data = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'HomeAndConstructionBusiness'],
    '@id': `${SITE_URL}/#business`,
    name: business.name,
    description:
      'Rathod Brothers provides earthmoving and heavy machinery services in Karnataka, including Hitachi and Tata excavator sale and service, tipper transport, JCB earthmoving and site clearance.',
    url: SITE_URL,
    telephone: `+${business.phones[0].digits}`,
    email: business.email,
    image: `${SITE_URL}/og-image.svg`,
    logo: `${SITE_URL}/favicon.svg`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: business.location.city,
      addressRegion: business.location.state,
      addressCountry: 'IN',
    },
    areaServed: {
      '@type': 'State',
      name: 'Karnataka',
    },
    sameAs: business.social.map((account) => account.url),
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: `+${business.phones[0].digits}`,
        contactType: 'sales',
        areaServed: 'IN',
        availableLanguage: ['en', 'kn'],
      },
      {
        '@type': 'ContactPoint',
        telephone: `+${business.phones[1].digits}`,
        contactType: 'sales',
        areaServed: 'IN',
        availableLanguage: ['en', 'kn'],
      },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Earthmoving & Heavy Machinery Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: 'Hitachi & Tata Excavators — Sale & Service' },
        },
        {
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: 'Tipper Transport — Local & State-wide' },
        },
        {
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: 'JCB Earthmovers — Site Clearance & Earthmoving' },
        },
        {
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: 'Site Clearance' },
        },
      ],
    },
  };

  return JSON.stringify(data);
}

/** Injects or replaces the JSON-LD script tag. */
export function injectJsonLd(json: string, id = 'rb-jsonld'): void {
  const existing = document.getElementById(id);
  if (existing) existing.remove();

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = id;
  script.textContent = json;
  document.head.appendChild(script);
}

/** Applies a full set of page metadata in one call. */
export function applyPageMeta({ title, description, path, index = true }: PageMeta): void {
  setDocumentTitle(title);
  setCanonical(path);
  setRobots(index);

  upsertMeta('meta[name="description"]', 'name', 'description', description);
  upsertMeta('meta[property="og:title"]', 'property', 'og:title', title);
  upsertMeta('meta[property="og:description"]', 'property', 'og:description', description);
  upsertMeta('meta[property="og:url"]', 'property', 'og:url', `${SITE_URL}${path}`);
  upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
  upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
}

/**
 * Analytics slots.
 *
 * No IDs are configured by default — adding a real one here is the only change
 * needed to switch on Google Analytics, Google Search Console verification or
 * Meta Pixel. Left null, nothing is injected and no third-party script loads.
 */
export const analytics = {
  googleAnalyticsId: null as string | null,
  metaPixelId: null as string | null,
  googleSiteVerification: null as string | null,
};
