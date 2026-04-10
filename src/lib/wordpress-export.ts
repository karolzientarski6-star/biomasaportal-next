import type { Metadata } from "next";
import { promises as fs } from "node:fs";
import path from "node:path";
import { load } from "cheerio";
import { cache } from "react";

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

  return readJson<ExportedRoute>(path.join(ROUTES_DIR, entry.file));
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

  return routes.filter((route): route is ExportedRoute => Boolean(route));
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

export function buildRouteMetadata(route: ExportedRoute): Metadata {
  return {
    title: route.title,
    description: route.metaDescription || undefined,
    alternates: {
      canonical: route.canonicalUrl || route.path,
    },
    robots: parseRobots(route.robots),
    openGraph: route.openGraph.title
      ? {
          title: route.openGraph.title,
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
          title: route.openGraph.title || route.title,
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
      image: route.openGraph.image || null,
      canonicalUrl: route.canonicalUrl || route.url,
      lastModified: readSchemaTimestamp(route),
    }))
    .sort((left, right) => right.lastModified.localeCompare(left.lastModified));
});
