import type { Metadata } from "next";
import { promises as fs } from "node:fs";
import path from "node:path";
import { load } from "cheerio";
import { cache } from "react";

const ABSOLUTE_SITE_URL = "https://biomasaportal.pl";

/** Convert https://biomasaportal.pl/wp-content/... → /wp-content/... so Vercel serves from /public/ */
function normalizeWpUrl(url: string | null | undefined): string {
  if (!url) return url as string;
  if (url.startsWith(`${ABSOLUTE_SITE_URL}/wp-content/`)) {
    return url.slice(ABSOLUTE_SITE_URL.length);
  }
  return url;
}

export type ExportedRouteSeo = {
  canonicalUrl: string;
  robots: string;
  openGraph: {
    title: string;
    description: string;
    type: string;
    url: string;
    image: string;
    siteName: string;
    locale: string;
  };
  twitterCard: string;
  schemaJsonLd: string[];
};

export type ExportedRoute = {
  path: string;
  url: string;
  title: string;
  metaDescription: string;
  canonicalUrl: string;
  robots: string;
  openGraph: ExportedRouteSeo["openGraph"];
  twitterCard: string;
  schemaJsonLd: string[];
  html: string;
  bodyClass: string;
  stylesheets: string[];
  exportedAt: string;
  source: string;
};

type RouteManifest = {
  generatedAt: string;
  routes: Array<{
    path: string;
    file: string;
    title: string;
    metaDescription: string;
    source: string;
  }>;
};

export type ExportedClassified = {
  id: number;
  slug: string;
  path: string;
  title: string;
  excerpt: string;
  image: string | null;
  price: number | null;
  location: string | null;
  email: string | null;
  phone: string | null;
  featured: boolean;
  viewsCount: number;
  author: string | null;
  statusLabel: string;
  categoryNames: string[];
};

export type ExportedClassifiedCategory = {
  id: number;
  name: string;
  slug: string;
  count: number;
  parent: number;
};

export type BlogSearchEntry = {
  path: string;
  title: string;
  excerpt: string;
  image: string | null;
  canonicalUrl: string;
  lastModified: string;
};

const DATA_DIR = path.join(process.cwd(), "data", "wordpress");
const ROUTES_DIR = path.join(DATA_DIR, "routes");

const ALWAYS_DROP_STYLESHEET_PATTERNS = [
  "/plugins/cookie-notice/css/front.min.css",
  "/assets/lib/animations/styles/",
  "/plugins/woocommerce/assets/client/blocks/wc-blocks.css",
];

const CONDITIONAL_WIDGET_STYLES: Array<{
  pattern: string;
  marker: string;
}> = [
  {
    pattern: "/assets/css/widget-search-form.min.css",
    marker: "elementor-widget-search-form",
  },
  {
    pattern: "/assets/css/widget-post-info.min.css",
    marker: "elementor-widget-post-info",
  },
  {
    pattern: "/assets/css/widget-image-box.min.css",
    marker: "elementor-widget-image-box",
  },
  {
    pattern: "/assets/css/widget-menu-anchor.min.css",
    marker: "elementor-widget-menu-anchor",
  },
  {
    pattern: "/assets/css/widget-icon-list.min.css",
    marker: "elementor-widget-icon-list",
  },
  {
    pattern: "/assets/css/widget-divider.min.css",
    marker: "elementor-widget-divider",
  },
  {
    pattern: "/assets/css/widget-spacer.min.css",
    marker: "elementor-widget-spacer",
  },
];

const GOOGLE_FONT_ALLOWLIST = new Set([
  "roboto",
  "raleway",
]);

const readJson = cache(async function readJsonFile<T>(
  filePath: string,
): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
});

const getManifest = cache(async function getManifestFile() {
  return readJson<RouteManifest>(path.join(DATA_DIR, "manifest.json"));
});

export function readSchemaTimestamp(route: ExportedRoute) {
  for (const schema of route.schemaJsonLd) {
    try {
      const payload = JSON.parse(schema) as {
        "@graph"?: Array<Record<string, unknown>>;
        dateModified?: string;
      };
      const graph = payload["@graph"] ?? [payload];

      for (const entry of graph) {
        const dateModified = entry.dateModified;

        if (typeof dateModified === "string" && dateModified) {
          return dateModified;
        }
      }
    } catch {
      continue;
    }
  }

  return route.exportedAt;
}

export function readSchemaArticleSections(route: ExportedRoute) {
  const sections = new Set<string>();

  for (const schema of route.schemaJsonLd) {
    try {
      const payload = JSON.parse(schema) as {
        "@graph"?: Array<Record<string, unknown>>;
        articleSection?: string | string[];
      };
      const graph = payload["@graph"] ?? [payload];

      for (const entry of graph) {
        const articleSection = entry.articleSection;

        if (typeof articleSection === "string" && articleSection.trim()) {
          sections.add(articleSection.trim());
        }

        if (Array.isArray(articleSection)) {
          for (const section of articleSection) {
            if (typeof section === "string" && section.trim()) {
              sections.add(section.trim());
            }
          }
        }
      }
    } catch {
      continue;
    }
  }

  return [...sections];
}

function extractExcerptFromHtml(route: ExportedRoute) {
  if (route.metaDescription) {
    return route.metaDescription;
  }

  const $ = load(route.html);
  const paragraph = $(".elementor-widget-text-editor p").first().text().replace(/\s+/g, " ").trim();
  return paragraph.slice(0, 220);
}

function isCommerceRoute(route: ExportedRoute) {
  return (
    route.path.startsWith("/shop") ||
    route.path.startsWith("/product/") ||
    route.path.startsWith("/product-category/") ||
    route.bodyClass.includes("single-product") ||
    route.bodyClass.includes("tax-product_cat") ||
    route.bodyClass.includes("tax-product_tag") ||
    route.bodyClass.includes("post-type-archive-product") ||
    route.bodyClass.includes("woocommerce-page")
  );
}

function shouldKeepGoogleFontStylesheet(url: string) {
  if (!url.includes("fonts.googleapis.com/css")) {
    return true;
  }

  const decodedUrl = decodeURIComponent(url).toLowerCase();
  const familyMatch = decodedUrl.match(/[?&]family=([^&]+)/);
  if (!familyMatch?.[1]) {
    return true;
  }

  const family = familyMatch[1].replace(/\+/g, " ").split(":")[0].trim();
  return GOOGLE_FONT_ALLOWLIST.has(family);
}

function optimizeRouteStylesheets(route: ExportedRoute) {
  const html = route.html;
  const commerceRoute = isCommerceRoute(route);
  const seen = new Set<string>();

  return route.stylesheets
    .filter((href) => Boolean(href))
    .filter((href) =>
      ALWAYS_DROP_STYLESHEET_PATTERNS.every((pattern) => !href.includes(pattern)),
    )
    .filter((href) => {
      if (
        !commerceRoute &&
        href.includes("/plugins/woocommerce/assets/css/")
      ) {
        return false;
      }

      return true;
    })
    .filter((href) =>
      CONDITIONAL_WIDGET_STYLES.every(
        ({ pattern, marker }) => !href.includes(pattern) || html.includes(marker),
      ),
    )
    .filter((href) => shouldKeepGoogleFontStylesheet(href))
    .filter((href) => {
      if (seen.has(href)) {
        return false;
      }
      seen.add(href);
      return true;
    });
}

export function normalizePath(routePath: string) {
  if (!routePath || routePath === "/") {
    return "/";
  }

  return routePath.endsWith("/") ? routePath : `${routePath}/`;
}

export const getRouteByPath = cache(async function getRouteByPathCached(
  routePath: string,
) {
  const manifest = await getManifest();

  if (!manifest) {
    return null;
  }

  const entry = manifest.routes.find(
    (route) => route.path === normalizePath(routePath),
  );

  if (!entry) {
    return null;
  }

  const route = await readJson<ExportedRoute>(path.join(ROUTES_DIR, entry.file));
  if (!route) return null;

  // Normalize all absolute biomasaportal.pl/wp-content/ URLs to relative paths
  // so Vercel serves them from /public/wp-content/ without cross-origin redirects
  return {
    ...route,
    stylesheets: optimizeRouteStylesheets({
      ...route,
      stylesheets: route.stylesheets.map(normalizeWpUrl),
    }),
    openGraph: {
      ...route.openGraph,
      image: normalizeWpUrl(route.openGraph.image),
    },
  };
});

export const getAllRoutes = cache(async function getAllRoutesCached() {
  const manifest = await getManifest();

  if (!manifest) {
    return [];
  }

  const routes = await Promise.all(
    manifest.routes.map(async (entry) =>
      readJson<ExportedRoute>(path.join(ROUTES_DIR, entry.file)),
    ),
  );

  return routes
    .filter((route): route is ExportedRoute => Boolean(route))
    .map((route) => ({
      ...route,
      stylesheets: optimizeRouteStylesheets({
        ...route,
        stylesheets: route.stylesheets.map(normalizeWpUrl),
      }),
      openGraph: {
        ...route.openGraph,
        image: normalizeWpUrl(route.openGraph.image),
      },
    }));
});

function parseRobots(robots: string): Metadata["robots"] {
  if (!robots) {
    return undefined;
  }

  const directives = robots
    .split(",")
    .map((directive) => directive.trim().toLowerCase());

  return {
    index: !directives.includes("noindex"),
    follow: !directives.includes("nofollow"),
  };
}

/**
 * Naprawia tytuł strony dla produktów WooCommerce.
 * Yoast eksportował "Nazwa produktu - | Biomasa Portal" (pusta kategoria w separatorze).
 * Dla /shop/ tytuł to całkowicie pusty "- | Biomasa Portal".
 */
function sanitizeRouteTitle(route: ExportedRoute): string {
  const { title, path, openGraph } = route;

  // Wzorzec błędu: "Coś - | Site" lub "- | Site"
  if (!/ - \|/.test(title) && !/^-\s*\|/.test(title)) {
    return title;
  }

  // Strona sklepu
  if (path === "/shop/" || path.startsWith("/shop/page/")) {
    return "Sprzedaż maszyn leśnych | BiomasaPortal";
  }

  // Strona produktu — OG title zawiera czystą nazwę produktu
  const productName = openGraph?.title?.trim() || title.replace(/\s*-\s*\|.*$/, "").trim();
  if (productName) {
    return `${productName} | Maszyny Leśne – BiomasaPortal`;
  }

  return "Maszyny Leśne – BiomasaPortal";
}

export function buildRouteMetadata(route: ExportedRoute): Metadata {
  const cleanTitle = sanitizeRouteTitle(route);

  return {
    title: cleanTitle,
    description: route.metaDescription || undefined,
    alternates: {
      canonical: route.canonicalUrl || route.path,
    },
    robots: parseRobots(route.robots),
    openGraph: (route.openGraph.title || cleanTitle)
      ? {
          title: route.openGraph.title || cleanTitle,
          description:
            route.openGraph.description || route.metaDescription || undefined,
          type:
            route.openGraph.type === "article"
              ? "article"
              : route.openGraph.type === "website"
                ? "website"
                : undefined,
          url: route.openGraph.url || undefined,
          images: route.openGraph.image ? [route.openGraph.image] : undefined,
          siteName: route.openGraph.siteName || undefined,
          locale: route.openGraph.locale || undefined,
        }
      : undefined,
    twitter: route.twitterCard
      ? {
          card:
            route.twitterCard === "summary_large_image"
              ? "summary_large_image"
              : "summary",
          title: route.openGraph.title || cleanTitle,
          description:
            route.openGraph.description || route.metaDescription || undefined,
          images: route.openGraph.image ? [route.openGraph.image] : undefined,
        }
      : undefined,
  };
}

export async function getRouteMetadata(routePath: string) {
  const route = await getRouteByPath(routePath);
  return route ? buildRouteMetadata(route) : {};
}

export const getClassifieds = cache(async function getClassifiedsCached() {
  return (await readJson<ExportedClassified[]>(
    path.join(DATA_DIR, "classifieds.json"),
  )) ?? [];
});

export const getClassifiedCategories = cache(
  async function getClassifiedCategoriesCached() {
    return (await readJson<ExportedClassifiedCategory[]>(
      path.join(DATA_DIR, "classified-categories.json"),
    )) ?? [];
  },
);

export async function getClassifiedsByAuthorHint(authorHint: string) {
  const classifieds = await getClassifieds();
  return classifieds.filter((item) =>
    item.author?.toLowerCase().includes(authorHint.toLowerCase()),
  );
}

export const getBlogSearchIndex = cache(async function getBlogSearchIndexCached() {
  const routes = await getAllRoutes();

  return routes
    .filter(
      (route) =>
        route.bodyClass.includes("single-post") &&
        !route.path.startsWith("/ogloszenia/"),
    )
    .map<BlogSearchEntry>((route) => ({
      path: route.path,
      title: route.openGraph.title || route.title,
      excerpt: extractExcerptFromHtml(route),
      image: normalizeWpUrl(route.openGraph.image) || null,
      canonicalUrl: route.canonicalUrl || route.url,
      lastModified: readSchemaTimestamp(route),
    }))
    .sort((left, right) => right.lastModified.localeCompare(left.lastModified));
});
