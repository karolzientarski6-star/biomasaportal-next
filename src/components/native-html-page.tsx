import { load } from "cheerio";
import type { ExportedRoute } from "@/lib/wordpress-export";
import { transformExportedHtml } from "@/lib/html-transform";
import { NativePublicPageFrame } from "./native-public-page-frame";

type NativeHtmlPageProps = {
  path: string;
  route: ExportedRoute;
};

function extractContentHtml(route: ExportedRoute) {
  const source = load(route.html);

  const pageRoot =
    source('div[data-elementor-type="wp-page"]').first().length > 0
      ? source('div[data-elementor-type="wp-page"]').first()
      : source("main#content").first().length > 0
        ? source("main#content").first()
        : source("main").first().length > 0
          ? source("main").first()
          : source("article").first();

  if (!pageRoot.length) {
    return {
      html: transformExportedHtml(route.html),
      className: "native-html-page__content",
    };
  }

  const className = pageRoot.attr("class")?.trim() ?? "native-html-page__content";
  const fragmentHtml = source.html(pageRoot) ?? "";

  return {
    html: transformExportedHtml(fragmentHtml),
    className,
  };
}

export function NativeHtmlPage({ path, route }: NativeHtmlPageProps) {
  const content = extractContentHtml(route);

  return (
    <NativePublicPageFrame path={path} route={route}>
      <div
        className={`native-html-page ${content.className}`}
        dangerouslySetInnerHTML={{ __html: content.html }}
      />
    </NativePublicPageFrame>
  );
}
