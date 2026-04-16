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

type EditorialCategoryPageProps = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({
  params,
}: EditorialCategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const category = getEditorialCategoryBySlug(resolvedParams.category);

  if (!category) {
    return {};
  }

  return buildEditorialArchiveMetadata(
    category.seoTitle,
    category.seoDescription,
    `/biomasa-w-polsce/${category.slug}/`,
  );
}

export default async function EditorialCategoryPage({
  params,
}: EditorialCategoryPageProps) {
  const resolvedParams = await params;
  const category = getEditorialCategoryBySlug(resolvedParams.category);

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

  const mainWidgetSignature =
    extractElementorPostsWidgetSignatures(templateRoute.html)[0] ?? null;

  return (
    <EditorialCategoryArchivePage
      path={`/biomasa-w-polsce/${category.slug}/`}
      route={templateRoute}
      category={category}
      items={items}
      currentPage={1}
      perPage={POSTS_PER_PAGE}
      widgetSignature={mainWidgetSignature}
    />
  );
}
