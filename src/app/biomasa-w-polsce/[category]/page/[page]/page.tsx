import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditorialCategoryArchivePage } from "@/components/editorial-category-archive-page";
import { buildEditorialArchiveMetadata } from "@/lib/editorial";
import { getBlogIndexByCategory } from "@/lib/blog-index";
import { getEditorialCategoryBySlug } from "@/lib/editorial-categories";

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

  const items = await getBlogIndexByCategory(category.slug);

  const pageCount = Math.max(1, Math.ceil(items.length / POSTS_PER_PAGE));
  if (page > pageCount) {
    notFound();
  }

  return (
    <EditorialCategoryArchivePage
      category={category}
      items={items}
      currentPage={page}
      perPage={POSTS_PER_PAGE}
    />
  );
}
