import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditorialCategoryArchivePage } from "@/components/editorial-category-archive-page";
import { buildEditorialArchiveMetadata } from "@/lib/editorial";
import { getBlogIndexByCategory } from "@/lib/blog-index";
import {
  getEditorialCategoryBySlug,
  type EditorialCategory,
} from "@/lib/editorial-categories";
import { getRouteByPath } from "@/lib/wordpress-export";

/**
 * Mapowanie slugów kategorii WordPress → slug kategorii editorialowej.
 * Stare URL-e WP (/category/{wpSlug}/) serwują treść natywnie bez redirectu.
 * Canonical wskazuje na /biomasa-w-polsce/{editorialSlug}/ — konsolidacja SEO.
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

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

function resolveEditorialCategory(wpSlug: string): EditorialCategory | null {
  const editorialSlug = WP_CATEGORY_MAP[wpSlug];
  if (!editorialSlug) return null;
  return getEditorialCategoryBySlug(editorialSlug);
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = resolveEditorialCategory(slug);

  if (!category) {
    return {};
  }

  // Canonical wskazuje na nowy URL /biomasa-w-polsce/ — bez redirectu, tylko sygnał dla Google
  return buildEditorialArchiveMetadata(
    category.seoTitle,
    category.seoDescription,
    `/biomasa-w-polsce/${category.slug}/`,
  );
}

export default async function WpCategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = resolveEditorialCategory(slug);

  if (!category) {
    notFound();
  }

  const [templateRoute, items] = await Promise.all([
    getRouteByPath(TEMPLATE_PATH),
    getBlogIndexByCategory(category.slug),
  ]);

  if (!templateRoute) {
    notFound();
  }

  return (
    <EditorialCategoryArchivePage
      path={`/biomasa-w-polsce/${category.slug}/`}
      route={templateRoute}
      category={category}
      items={items}
      currentPage={1}
      perPage={POSTS_PER_PAGE}
    />
  );
}
