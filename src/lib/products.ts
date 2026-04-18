import { cache } from "react";
import { load } from "cheerio";
import {
  getAllRoutes,
  getRouteByPath,
  normalizePath,
  type ExportedRoute,
} from "@/lib/wordpress-export";
import { normalizeWpImageUrl } from "@/lib/html-transform";

export type ProductIndexItem = {
  path: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string | null;
  categorySlug: string | null;
  categoryName: string | null;
};

type ParsedProductCard = {
  path: string;
  title: string;
  image: string | null;
};

function normalizeSitePath(pathOrUrl: string) {
  if (pathOrUrl.startsWith("https://biomasaportal.pl")) {
    const parsed = new URL(pathOrUrl);
    return normalizePath(parsed.pathname);
  }

  return normalizePath(pathOrUrl);
}

function titleCaseFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

function parseProductCards(route: ExportedRoute) {
  const $ = load(route.html);

  return $("ul.products li.product")
    .map((_, element) => {
      const product = $(element);
      const link = product.find("a.woocommerce-LoopProduct-link").first();
      const href = link.attr("href");

      if (!href) {
        return null;
      }

      const image =
        product.find("img").first().attr("src") ??
        product.find("img").first().attr("data-src") ??
        null;

      return {
        path: normalizeSitePath(href),
        title:
          product.find(".woocommerce-loop-product__title").first().text().trim() || "",
        image: normalizeWpImageUrl(image),
      } satisfies ParsedProductCard;
    })
    .get()
    .filter((item): item is ParsedProductCard => Boolean(item?.path));
}

function parseProductExcerpt(route: ExportedRoute) {
  const $ = load(route.html);
  const text = $(".woocommerce-product-details__short-description")
    .text()
    .replace(/\s+/g, " ")
    .trim();

  return text || route.metaDescription || "";
}

function parseProductCategory(route: ExportedRoute) {
  const categoryToken = route.bodyClass
    .split(/\s+/)
    .find((token) => token.startsWith("product_cat-"));

  if (!categoryToken) {
    return {
      categorySlug: null,
      categoryName: null,
    };
  }

  const categorySlug = categoryToken.replace("product_cat-", "");
  return {
    categorySlug,
    categoryName: titleCaseFromSlug(categorySlug),
  };
}

function getShopPageNumber(routePath: string) {
  if (routePath === "/shop/" || routePath === "/shop/page/1/") {
    return 1;
  }

  const match = routePath.match(/^\/shop\/page\/(\d+)\/$/);
  return match ? Number.parseInt(match[1], 10) : null;
}

export const getProductIndex = cache(async function getProductIndexCached() {
  const routes = await getAllRoutes();
  const productRoutes = routes.filter((route) => route.path.startsWith("/product/"));
  const shopRoutes = routes
    .filter((route) => route.path === "/shop/" || route.path.startsWith("/shop/page/"))
    .sort((left, right) => {
      const leftPage = getShopPageNumber(left.path) ?? Number.MAX_SAFE_INTEGER;
      const rightPage = getShopPageNumber(right.path) ?? Number.MAX_SAFE_INTEGER;
      return leftPage - rightPage;
    });

  const orderMap = new Map<string, number>();
  let nextOrder = 0;

  for (const shopRoute of shopRoutes) {
    for (const card of parseProductCards(shopRoute)) {
      if (!orderMap.has(card.path)) {
        orderMap.set(card.path, nextOrder);
        nextOrder += 1;
      }
    }
  }

  const products = productRoutes.map((route) => {
    const { categoryName, categorySlug } = parseProductCategory(route);
    const normalizedPath = normalizePath(route.path);

    return {
      path: normalizedPath,
      slug: normalizedPath.replace(/^\/product\//, "").replace(/\/$/, ""),
      title: route.openGraph.title || route.title,
      excerpt: parseProductExcerpt(route),
      image: normalizeWpImageUrl(route.openGraph.image),
      categorySlug,
      categoryName,
      order: orderMap.get(normalizedPath) ?? Number.MAX_SAFE_INTEGER,
    };
  });

  return products
    .sort((left, right) => left.order - right.order || left.title.localeCompare(right.title))
    .map(({ order: _order, ...product }) => product);
});

export async function getProductBySlug(slug: string) {
  const route = await getRouteByPath(`/product/${slug}/`);

  if (!route || !route.bodyClass.includes("single-product")) {
    return null;
  }

  const products = await getProductIndex();
  const item = products.find((product) => product.slug === slug) ?? null;

  return {
    route,
    item,
  };
}

export async function getProductsByCategory(categorySlug: string) {
  const products = await getProductIndex();
  return products.filter((product) => product.categorySlug === categorySlug);
}
