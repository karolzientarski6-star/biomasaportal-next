import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditorialCategoryArchivePage } from "@/components/editorial-category-archive-page";
import { buildEditorialArchiveMetadata } from "@/lib/editorial";
import { getBlogIndexByCategory } from "@/lib/blog-index";
import { getEditorialCategoryBySlug } from "@/lib/editorial-categories";
import { extractElementorPostsWidgetSignatures } from "@/lib/elementor-posts-widget";
import { getRouteByPath } from "@/lib/wordpress-export";

const TEMPLATE_PATH = "/wpisy/";
const POSTS_PER_PAGE = 12;

type EditorialCategoryPaginationProps = {
  params: Promise<{ category: string; page: string }>;
};

function parsePageNumber(value: string) {
  const page = Number.parseInt(value, 10);
  return Number.isFinite(page) && page > 1 ? page : null;
}

export async function generateMetadata({
  params,
}: EditorialCategoryPaginationProps): Promise<Metadata> {
  const resolvedParams = await params;
  const category = getEditorialCategoryBySlug(resolvedParams.category);
  const page = parsePageNumber(resolvedParams.page);

  if (!category || !page) {
    return {};
  }

  return buildEditorialArchiveMetadata(
    `${category.name} - strona ${page} | BiomasaPortal`,
    category.seoDescription,
    `/biomasa-w-polsce/${category.slug}/page/${page}/`,
  );
}

export default async function EditorialCategoryPaginationPage({
  params,
}: EditorialCategoryPaginationProps) {
  const resolvedParams = await params;
  const category = getEditorialCategoryBySlug(resolvedParams.category);
  const page = parsePageNumber(resolvedParams.page);

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

  const widgetSignature =
    extractElementorPostsWidgetSignatures(templateRoute.html)[0] ?? null;

  return (
    <EditorialCategoryArchivePage
      path={`/biomasa-w-polsce/${category.slug}/page/${page}/`}
      route={templateRoute}
      category={category}
      items={items}
      currentPage={page}
      perPage={POSTS_PER_PAGE}
      widgetSignature={widgetSignature}
    />
  );
}
