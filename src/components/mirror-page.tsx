import { notFound } from "next/navigation";
import { getRouteByPath, type ExportedRoute } from "@/lib/wordpress-export";
import { MirrorHtml } from "./mirror-html";
import { WordPressBodyClass } from "./wordpress-body-class";
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
      <div className="wp-mirror-page">
        <MirrorHtml html={route.html} />
      </div>
    </>
  );
}
