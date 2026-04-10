import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { getRouteByPath, type ExportedRoute } from "@/lib/wordpress-export";
import { MirrorHtml } from "./mirror-html";
import { WordPressBodyClass } from "./wordpress-body-class";
import { WordPressInteractiveEnhancer } from "./wordpress-interactive-enhancer";
import { WordPressAssets } from "./wordpress-assets";
import { WordPressSeoScripts } from "./wordpress-seo-scripts";

type MirrorPageProps = {
  path: string;
  route?: ExportedRoute;
};

export async function MirrorPage({
  path,
  route: providedRoute,
}: MirrorPageProps) {
  const route = providedRoute ?? (await getRouteByPath(path));

  if (!route) {
    notFound();
  }

  return (
    <>
      <WordPressBodyClass className={route.bodyClass} />
      <WordPressAssets stylesheets={route.stylesheets} />
      <WordPressSeoScripts schemaJsonLd={route.schemaJsonLd} />
      <WordPressInteractiveEnhancer
        path={path}
        featuredImage={route.openGraph.image}
        isSinglePost={route.bodyClass.includes("single-post")}
      />
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
        <MirrorHtml html={route.html} />
      </div>
    </>
  );
}
