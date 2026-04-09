import type { Metadata } from "next";
import { promises as fs } from "node:fs";
import path from "node:path";

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

const DATA_DIR = path.join(process.cwd(), "data", "wordpress");
const ROUTES_DIR = path.join(DATA_DIR, "routes");

async function readJson<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function getManifest() {
  return readJson<RouteManifest>(path.join(DATA_DIR, "manifest.json"));
}

export function normalizePath(routePath: string) {
  if (!routePath || routePath === "/") {
    return "/";
  }

  return routePath.endsWith("/") ? routePath : `${routePath}/`;
}

export async function getRouteByPath(routePath: string) {
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
}

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

export async function getClassifieds() {
  return (await readJson<ExportedClassified[]>(
    path.join(DATA_DIR, "classifieds.json"),
  )) ?? [];
}

export async function getClassifiedCategories() {
  return (await readJson<ExportedClassifiedCategory[]>(
    path.join(DATA_DIR, "classified-categories.json"),
  )) ?? [];
}

export async function getClassifiedsByAuthorHint(authorHint: string) {
  const classifieds = await getClassifieds();
  return classifieds.filter((item) =>
    item.author?.toLowerCase().includes(authorHint.toLowerCase()),
  );
}
