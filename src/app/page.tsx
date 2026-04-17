import type { Metadata } from "next";
import { HomeLatestPostsSection } from "@/components/home-latest-posts-section";
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
          selector: ".elementor-element-64cd8fb",
          slotId: "home-latest-posts-section",
          node: (
            <HomeLatestPostsSection
              items={latestItems}
              widgetSignature={widgetSignature}
            />
          ),
        },
      ]}
    />
  );
}
