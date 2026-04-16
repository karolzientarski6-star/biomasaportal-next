import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditorialCategoryArchivePage } from "@/components/editorial-category-archive-page";
import { buildEditorialArchiveMetadata } from "@/lib/editorial";
import { getBlogIndexByCategory } from "@/lib/blog-index";
import { getEditorialCategoryBySlug } from "@/lib/editorial-categories";

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

  const items = await getBlogIndexByCategory(category.slug);

  return (
    <EditorialCategoryArchivePage
      category={category}
      items={items}
      currentPage={1}
      perPage={POSTS_PER_PAGE}
    />
  );
}
