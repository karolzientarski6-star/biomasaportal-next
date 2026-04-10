import {
  getAllRoutes,
  getBlogSearchIndex,
  getClassifieds,
  readSchemaTimestamp,
} from "@/lib/wordpress-export";

const SITE_URL = "https://biomasaportal.pl";

export type SitemapEntry = {
  loc: string;
  lastmod: string;
};

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function toAbsoluteUrl(pathOrUrl: string) {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }

  return `${SITE_URL}${pathOrUrl}`;
}

export function buildSitemapUrlSet(entries: SitemapEntry[]) {
  const urls = entries
    .map(
      (entry) =>
        `<url><loc>${escapeXml(entry.loc)}</loc><lastmod>${escapeXml(entry.lastmod)}</lastmod></url>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

export function buildSitemapIndex(entries: SitemapEntry[]) {
  const sitemaps = entries
    .map(
      (entry) =>
        `<sitemap><loc>${escapeXml(entry.loc)}</loc><lastmod>${escapeXml(entry.lastmod)}</lastmod></sitemap>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemaps}</sitemapindex>`;
}

export async function getPostSitemapEntries() {
  const posts = await getBlogSearchIndex();
  return posts.map((post) => ({
    loc: toAbsoluteUrl(post.canonicalUrl || post.path),
    lastmod: post.lastModified,
  }));
}

export async function getPageSitemapEntries() {
  const routes = await getAllRoutes();

  return routes
    .filter(
      (route) =>
        route.bodyClass.includes("page") &&
        !route.bodyClass.includes("single-post") &&
        !route.bodyClass.includes("single-product"),
    )
    .map((route) => ({
      loc: toAbsoluteUrl(route.canonicalUrl || route.path),
      lastmod: route.exportedAt,
    }));
}

export async function getProductSitemapEntries() {
  const routes = await getAllRoutes();

  return routes
    .filter((route) => route.bodyClass.includes("single-product"))
    .map((route) => ({
      loc: toAbsoluteUrl(route.canonicalUrl || route.path),
      lastmod: route.exportedAt,
    }));
}

export async function getClassifiedSitemapEntries() {
  const classifieds = await getClassifieds();
  const now = new Date().toISOString();

  return classifieds.map((classified) => ({
    loc: toAbsoluteUrl(classified.path),
    lastmod: now,
  }));
}

export async function getClassifiedCategorySitemapEntries() {
  const routes = await getAllRoutes();

  return routes
    .filter(
      (route) =>
        route.path.startsWith("/kategoria-ogloszenia/") ||
        route.bodyClass.includes("tax-kategoria-ogloszenia"),
    )
    .map((route) => ({
      loc: toAbsoluteUrl(route.canonicalUrl || route.path),
      lastmod: readSchemaTimestamp(route),
    }));
}

export async function getSitemapIndexEntries() {
  const [posts, pages, products, classifieds, classifiedCategories] = await Promise.all([
    getPostSitemapEntries(),
    getPageSitemapEntries(),
    getProductSitemapEntries(),
    getClassifiedSitemapEntries(),
    getClassifiedCategorySitemapEntries(),
  ]);

  return [
    {
      loc: `${SITE_URL}/post-sitemap.xml`,
      lastmod: posts[0]?.lastmod ?? new Date().toISOString(),
    },
    {
      loc: `${SITE_URL}/page-sitemap.xml`,
      lastmod: pages[0]?.lastmod ?? new Date().toISOString(),
    },
    {
      loc: `${SITE_URL}/product-sitemap.xml`,
      lastmod: products[0]?.lastmod ?? new Date().toISOString(),
    },
    {
      loc: `${SITE_URL}/ogloszenie-sitemap.xml`,
      lastmod: classifieds[0]?.lastmod ?? new Date().toISOString(),
    },
    {
      loc: `${SITE_URL}/kategoria-ogloszenia-sitemap.xml`,
      lastmod: classifiedCategories[0]?.lastmod ?? new Date().toISOString(),
    },
  ].filter((entry) => {
    if (!entry.loc.endsWith("/kategoria-ogloszenia-sitemap.xml")) {
      return true;
    }

    return classifiedCategories.length > 0;
  });
}
