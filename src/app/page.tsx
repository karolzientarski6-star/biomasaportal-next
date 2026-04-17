import type { Metadata } from "next";
import Link from "next/link";
import { BlogArchiveGrid } from "@/components/blog-archive-grid";
import { MirrorTemplatePage } from "@/components/mirror-template-page";
import { getCombinedBlogIndex } from "@/lib/blog-index";
import { extractElementorPostsWidgetSignatures } from "@/lib/elementor-posts-widget";
import { buildRouteMetadata, getRouteByPath } from "@/lib/wordpress-export";

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
  const [route, blogItems] = await Promise.all([
    getRouteByPath("/"),
    getCombinedBlogIndex(),
  ]);
  const latestItems = blogItems.slice(0, 8);
  const widgetSignature =
    route
      ? extractElementorPostsWidgetSignatures(route.html).find((signature) =>
          (signature.attributes.class ?? "").includes("elementor-element-b47130f"),
        ) ?? null
      : null;

  return (
    <MirrorTemplatePage
      path="/"
      route={route ?? undefined}
      slots={[
        {
          selector: ".elementor-element-b47130f",
          slotId: "home-latest-posts-grid",
          node: (
            <BlogArchiveGrid
              items={latestItems}
              perPage={8}
              basePath="/wpisy/"
              widgetSignature={widgetSignature}
              showSummary={false}
            />
          ),
        },
        {
          selector: ".elementor-element-ca41823",
          slotId: "home-latest-posts-cta",
          node: (
            <div className="elementor-element elementor-element-ca41823 elementor-align-right elementor-mobile-align-center elementor-widget elementor-widget-button">
              <div className="elementor-widget-container">
                <div className="elementor-button-wrapper">
                  <Link
                    className="elementor-button elementor-button-link elementor-size-xs"
                    href="/wpisy/"
                  >
                    <span className="elementor-button-content-wrapper">
                      <span className="elementor-button-text">Wszystkie wpisy</span>
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          ),
        },
      ]}
    />
  );
}
