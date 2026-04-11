import { BlogArchiveGrid } from "@/components/blog-archive-grid";
import { WordPressFramePage } from "@/components/wordpress-frame-page";
import type { BlogIndexItem } from "@/lib/blog-index";
import type { EditorialCategory } from "@/lib/editorial-categories";
import type { ExportedRoute } from "@/lib/wordpress-export";

type EditorialCategoryArchivePageProps = {
  path: string;
  route: ExportedRoute;
  category: EditorialCategory;
  items: BlogIndexItem[];
  currentPage: number;
  perPage: number;
};

export function EditorialCategoryArchivePage({
  path,
  route,
  category,
  items,
  currentPage,
  perPage,
}: EditorialCategoryArchivePageProps) {
  return (
    <WordPressFramePage path={path} route={route}>
      <div className="editorial-category-page">
        <section className="editorial-category-page__intro">
          <p className="page-card__eyebrow">Biomasa w Polsce</p>
          <h1>{category.name}</h1>
          <p>{category.shortDescription}</p>
        </section>

        <BlogArchiveGrid
          items={items}
          title={category.name}
          intro={category.seoDescription}
          currentPage={currentPage}
          perPage={perPage}
          basePath={`/biomasa-w-polsce/${category.slug}/`}
          category={category}
          showSummary={false}
        />
      </div>
    </WordPressFramePage>
  );
}
