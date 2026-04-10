import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { transformExportedHtml } from "@/lib/html-transform";
import { type ExportedRoute, getRouteByPath } from "@/lib/wordpress-export";
import { WordPressAssets } from "./wordpress-assets";
import { WordPressBodyClass } from "./wordpress-body-class";
import { WordPressInteractiveEnhancer } from "./wordpress-interactive-enhancer";
import { WordPressSeoScripts } from "./wordpress-seo-scripts";

type WordPressFramePageProps = {
  path: string;
  route?: ExportedRoute;
  children: React.ReactNode;
};

function splitMainFromTemplate(html: string) {
  const mainStart = html.indexOf("<main");
  const mainEnd = mainStart >= 0 ? html.indexOf("</main>", mainStart) : -1;

  if (mainStart === -1 || mainEnd === -1) {
    return {
      beforeMain: html,
      afterMain: "",
    };
  }

  return {
    beforeMain: html.slice(0, mainStart),
    afterMain: html.slice(mainEnd + "</main>".length),
  };
}

export async function WordPressFramePage({
  path,
  route: providedRoute,
  children,
}: WordPressFramePageProps) {
  const route = providedRoute ?? (await getRouteByPath(path));

  if (!route) {
    notFound();
  }

  const html = transformExportedHtml(route.html);
  const { beforeMain, afterMain } = splitMainFromTemplate(html);

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
        {beforeMain ? (
          <div className="mirror-html" dangerouslySetInnerHTML={{ __html: beforeMain }} />
        ) : null}
        <main id="content" className="site-main post-196 page type-page status-publish hentry">
          {children}
        </main>
        {afterMain ? (
          <div className="mirror-html" dangerouslySetInnerHTML={{ __html: afterMain }} />
        ) : null}
      </div>
    </>
  );
}
