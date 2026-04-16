import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditorialCategoryArchivePage } from "@/components/editorial-category-archive-page";
import { buildEditorialArchiveMetadata } from "@/lib/editorial";
import { getBlogIndexByCategory } from "@/lib/blog-index";
import { getEditorialCategoryBySlug } from "@/lib/editorial-categories";
import { extractElementorPostsWidgetSignatures } from "@/lib/elementor-posts-widget";
import { getRouteByPath } from "@/lib/wordpress-export";

/**
 * Paginacja WP: /category/{wpSlug}/page/{n}/
 * Serwuje treść natywnie — bez redirectu.
 * Canonical → /biomasa-w-polsce/{editorialSlug}/page/{n}/
 */
const WP_CATEGORY_MAP: Record<string, string> = {
  biomasa: "biomasa",
  biogaz: "biogazownie",
  "maszyny-lesne": "maszyny-lesne",
  oze: "biomasa",
  pellet: "pellet",
  "zrebka-drzewna": "zrebka-i-trociny",
};

const TEMPLATE_PATH = "/wpisy/";
const POSTS_PER_PAGE = 12;

type WpCategoryPaginationProps = {
  params: Promise<{ slug: string; page: string }>;
};

function parsePageNumber(value: string) {
  const page = Number.parseInt(value, 10);
  return Number.isFinite(page) && page > 1 ? page : null;
}

export async function generateMetadata({
  params,
}: WpCategoryPaginationProps): Promise<Metadata> {
  const { slug, page: pageStr } = await params;
  const editorialSlug = WP_CATEGORY_MAP[slug];
  const category = editorialSlug ? getEditorialCategoryBySlug(editorialSlug) : null;
  const page = parsePageNumber(pageStr);

  if (!category || !page) {
    return {};
  }

  return buildEditorialArchiveMetadata(
    `${category.name} - strona ${page} | BiomasaPortal`,
    category.seoDescription,
    `/biomasa-w-polsce/${category.slug}/page/${page}/`,
  );
}

export default async function WpCategoryPaginationPage({
  params,
}: WpCategoryPaginationProps) {
  const { slug, page: pageStr } = await params;
  const editorialSlug = WP_CATEGORY_MAP[slug];
  const category = editorialSlug ? getEditorialCategoryBySlug(editorialSlug) : null;
  const page = parsePageNumber(pageStr);

  if (!category || !page) {
    notFound();
  }

  const [templateRoute, items] = await Promise.all([
    getRouteByPath(TEMPLATE_PATH),
    getBlogIndexByCategory(category.slug),
  ]);

  if (!templateRoute) {
    notFound();
  }

  const pageCount = Math.max(1, Math.ceil(items.length / POSTS_PER_PAGE));
  if (page > pageCount) {
    notFound();
  }

  const mainWidgetSignature =
    extractElementorPostsWidgetSignatures(templateRoute.html)[0] ?? null;

  return (
    <EditorialCategoryArchivePage
      path={`/biomasa-w-polsce/${category.slug}/page/${page}/`}
      route={templateRoute}
      category={category}
      items={items}
      currentPage={page}
      perPage={POSTS_PER_PAGE}
      widgetSignature={mainWidgetSignature}
    />
  );
}
