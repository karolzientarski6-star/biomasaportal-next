import { ContentArchivePage } from "@/components/content-archive-page";
import type { BlogIndexItem } from "@/lib/blog-index";
import type { EditorialCategory } from "@/lib/editorial-categories";

type EditorialCategoryArchivePageProps = {
  category: EditorialCategory;
  items: BlogIndexItem[];
  currentPage: number;
  perPage: number;
};

export function EditorialCategoryArchivePage({
  category,
  items,
  currentPage,
  perPage,
}: EditorialCategoryArchivePageProps) {
  return (
    <ContentArchivePage
      eyebrow="Biomasa w Polsce"
      title={category.name}
      intro={category.shortDescription}
      items={items}
      currentPage={currentPage}
      perPage={perPage}
      basePath={`/biomasa-w-polsce/${category.slug}/`}
      category={category}
    />
  );
}
