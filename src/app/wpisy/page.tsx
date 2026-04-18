import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NativeBlogArchivePage } from "@/components/native-blog-archive-page";
import { extractElementorPostsWidgetSignatures } from "@/lib/elementor-posts-widget";
import { getCombinedBlogIndex } from "@/lib/blog-index";
import { buildRouteMetadata, getRouteByPath } from "@/lib/wordpress-export";

const TEMPLATE_PATH = "/wpisy/";
const POSTS_PER_PAGE = 12;

export async function generateMetadata(): Promise<Metadata> {
  const route = await getRouteByPath(TEMPLATE_PATH);
  return route ? buildRouteMetadata(route) : {};
}

export default async function BlogArchivePage() {
  const [templateRoute, items] = await Promise.all([
    getRouteByPath(TEMPLATE_PATH),
    getCombinedBlogIndex(),
  ]);

  if (!templateRoute) {
    notFound();
  }

  const mainWidgetSignature =
    extractElementorPostsWidgetSignatures(templateRoute.html)[0] ?? null;

  return (
    <NativeBlogArchivePage
      path="/wpisy/"
      route={templateRoute}
      title="Wpisy"
      intro="Aktualnosci, poradniki i analizy rynku biomasy, pelletu, maszyn lesnych oraz dofinansowan w Polsce."
      items={items}
      currentPage={1}
      perPage={POSTS_PER_PAGE}
      basePath="/wpisy/"
      widgetSignature={mainWidgetSignature}
    />
  );
}
