import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogArchiveGrid } from "@/components/blog-archive-grid";
import { MirrorTemplatePage } from "@/components/mirror-template-page";
import { extractElementorPostsWidgetSignatures } from "@/lib/elementor-posts-widget";
import { getCombinedBlogIndex } from "@/lib/blog-index";
import { buildRouteMetadata, getRouteByPath } from "@/lib/wordpress-export";

const POSTS_PER_PAGE = 8;

export async function generateMetadata(): Promise<Metadata> {
  const route = await getRouteByPath("/");

  if (!route) {
    return {};
  }

  const metadata = buildRouteMetadata(route);

  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical: "/",
    },
  };
}

export default async function HomePage() {
  const [templateRoute, items] = await Promise.all([
    getRouteByPath("/"),
    getCombinedBlogIndex(),
  ]);

  if (!templateRoute) {
    notFound();
  }

  const mainWidgetSignature =
    extractElementorPostsWidgetSignatures(templateRoute.html)[0] ?? null;

  return (
    <MirrorTemplatePage
      path="/"
      route={templateRoute}
      slots={[
        {
          selector: ".elementor-widget-posts",
          slotId: "homepage-posts",
          node: (
            <BlogArchiveGrid
              items={items}
              currentPage={1}
              perPage={POSTS_PER_PAGE}
              basePath="/wpisy/"
              widgetSignature={mainWidgetSignature}
              showSummary={false}
            />
          ),
        },
      ]}
    />
  );
}
