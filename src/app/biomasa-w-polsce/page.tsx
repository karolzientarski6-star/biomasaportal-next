import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogArchiveGrid } from "@/components/blog-archive-grid";
import { EditorialCategoryHub } from "@/components/editorial-category-hub";
import { MirrorTemplatePage } from "@/components/mirror-template-page";
import { extractElementorPostsWidgetSignatures } from "@/lib/elementor-posts-widget";
import { buildEditorialArchiveMetadata } from "@/lib/editorial";
import { getCombinedBlogIndex } from "@/lib/blog-index";
import { EDITORIAL_CATEGORIES } from "@/lib/editorial-categories";
import { getRouteByPath } from "@/lib/wordpress-export";

const TEMPLATE_PATH = "/wpisy/";

export async function generateMetadata(): Promise<Metadata> {
  return buildEditorialArchiveMetadata(
    "Biomasa w Polsce - kategorie wpisow i analizy | BiomasaPortal",
    "Hub tresci BiomasaPortal: pellet, dofinansowania, biogazownie, maszyny lesne, piece i rynek biomasy w Polsce.",
    "/biomasa-w-polsce/",
  );
}

export default async function BiomasaInPolandPage() {
  const [templateRoute, items] = await Promise.all([
    getRouteByPath(TEMPLATE_PATH),
    getCombinedBlogIndex(),
  ]);

  if (!templateRoute) {
    notFound();
  }

  const mainWidgetSignature =
    extractElementorPostsWidgetSignatures(templateRoute.html)[0] ?? null;

  const categories = EDITORIAL_CATEGORIES.map((category) => ({
    category,
    totalPosts: items.filter((item) => item.categorySlug === category.slug).length,
    latestPosts: items.filter((item) => item.categorySlug === category.slug).slice(0, 2),
  }));

  return (
    <MirrorTemplatePage
      path="/biomasa-w-polsce/"
      route={templateRoute}
      slots={[
        {
          selector: ".elementor-widget-search-form",
          slotId: "editorial-category-hub",
          node: <EditorialCategoryHub categories={categories} />,
        },
        {
          selector: ".elementor-widget-posts",
          slotId: "editorial-latest-posts",
          node: (
            <BlogArchiveGrid
              items={items.slice(0, 12)}
              title="Najnowsze wpisy z rynku biomasy"
              intro="Pod ta sekcja splywaja najnowsze publikacje z calego klastra Biomasa w Polsce."
              currentPage={1}
              perPage={12}
              basePath="/wpisy/"
              widgetSignature={mainWidgetSignature}
            />
          ),
        },
      ]}
    />
  );
}
