import { notFound } from "next/navigation";
import { getRouteByPath, type ExportedRoute } from "@/lib/wordpress-export";
import { MirrorHtml } from "./mirror-html";
import { WordPressAssets } from "./wordpress-assets";

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
      <WordPressAssets stylesheets={route.stylesheets} />
      <div className={route.bodyClass ? `wp-mirror-page ${route.bodyClass}` : "wp-mirror-page"}>
        <MirrorHtml html={route.html} />
      </div>
    </>
  );
}
