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

type EditorialCategoryPageProps = {
  params: Promise<{ category: string }>;
};

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

  return (
    <MirrorTemplatePage
      path={`/biomasa-w-polsce/${category.slug}/`}
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
              currentPage={1}
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
