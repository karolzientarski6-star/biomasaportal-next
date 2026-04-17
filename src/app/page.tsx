import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { WordPressAssets } from "@/components/wordpress-assets";
import { WordPressBodyClass } from "@/components/wordpress-body-class";
import { WordPressInteractiveEnhancer } from "@/components/wordpress-interactive-enhancer";
import { WordPressSeoScripts } from "@/components/wordpress-seo-scripts";
import { getCombinedBlogIndex } from "@/lib/blog-index";
import { extractElementorPostsWidgetSignatures } from "@/lib/elementor-posts-widget";
import { buildHomeLatestPostsSectionHtml } from "@/lib/home-latest-posts-html";
import { injectHtmlSlots, transformExportedHtml } from "@/lib/html-transform";
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

  if (!route) {
    return null;
  }

  const latestItems = blogItems.slice(0, 8);
  const widgetSignature =
    extractElementorPostsWidgetSignatures(route.html).find((signature) =>
      (signature.attributes.class ?? "").includes("elementor-element-b47130f"),
    ) ?? null;
  const slotId = "home-latest-posts-section";
  const slotMarker = `<div data-next-slot="${slotId}"></div>`;
  const sectionHtml = buildHomeLatestPostsSectionHtml(latestItems, widgetSignature);
  const html = transformExportedHtml(
    injectHtmlSlots(route.html, [
      {
        selector: ".elementor-element-64cd8fb",
        slotId,
      },
    ]),
  ).replace(slotMarker, sectionHtml);

  return (
    <>
      <WordPressBodyClass className={route.bodyClass} />
      <WordPressAssets stylesheets={route.stylesheets} />
      <WordPressSeoScripts schemaJsonLd={route.schemaJsonLd} />
      <WordPressInteractiveEnhancer path="/" />
      <div
        className={`wp-mirror-page${route.bodyClass.includes("single-post") ? " wp-mirror-page--single-post" : ""}`}
        style={
          route.openGraph.image
            ? ({
                ["--wp-featured-image" as string]: `url("${route.openGraph.image}")`,
              } as CSSProperties)
            : undefined
        }
      >
        <div className="mirror-html" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </>
  );
}
