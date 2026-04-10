import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogArchiveGrid } from "@/components/blog-archive-grid";
import { MirrorTemplatePage } from "@/components/mirror-template-page";
import { buildEditorialArchiveMetadata } from "@/lib/editorial";
import { getBlogIndexByCategory } from "@/lib/blog-index";
import { getEditorialCategoryBySlug } from "@/lib/editorial-categories";
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

function CategoryIntro({ name, description }: { name: string; description: string }) {
  return (
    <div className="mirror-html editorial-category-intro">
      <section className="elementor-element elementor-widget">
        <div className="elementor-widget-container">
          <div className="blog-archive-summary">
            <p className="page-card__eyebrow">Biomasa w Polsce</p>
            <h1>{name}</h1>
            <p>{description}</p>
          </div>
        </div>
      </section>
    </div>
  );
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

  return (
    <MirrorTemplatePage
      path={`/biomasa-w-polsce/${category.slug}/page/${page}/`}
      route={templateRoute}
      slots={[
        {
          selector: ".elementor-widget-search-form",
          slotId: "editorial-category-intro",
          node: (
            <CategoryIntro
              name={category.name}
              description={category.shortDescription}
            />
          ),
        },
        {
          selector: ".elementor-widget-posts",
          slotId: "editorial-category-grid",
          node: (
            <BlogArchiveGrid
              items={items}
              title={category.name}
              intro={category.seoDescription}
              currentPage={page}
              perPage={POSTS_PER_PAGE}
              basePath={`/biomasa-w-polsce/${category.slug}/`}
              category={category}
            />
          ),
        },
      ]}
    />
  );
}
