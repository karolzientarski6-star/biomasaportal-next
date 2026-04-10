import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogArchiveGrid } from "@/components/blog-archive-grid";
import { MirrorTemplatePage } from "@/components/mirror-template-page";
import { buildEditorialArchiveMetadata } from "@/lib/editorial";
import { getCombinedBlogIndex } from "@/lib/blog-index";
import { getRouteByPath } from "@/lib/wordpress-export";

const TEMPLATE_PATH = "/wpisy/";
const POSTS_PER_PAGE = 12;

export async function generateMetadata(): Promise<Metadata> {
  return buildEditorialArchiveMetadata(
    "Wpisy o biomasie, pellecie i rynku drzewnym | BiomasaPortal",
    "Archiwum wpisow BiomasaPortal: pellet, biogazownie, dofinansowania, maszyny lesne i rynek biomasy w Polsce.",
    "/wpisy/",
  );
}

export default async function BlogArchivePage() {
  const [templateRoute, items] = await Promise.all([
    getRouteByPath(TEMPLATE_PATH),
    getCombinedBlogIndex(),
  ]);

  if (!templateRoute) {
    notFound();
  }

  return (
    <MirrorTemplatePage
      path="/wpisy/"
      route={templateRoute}
      slots={[
        {
          selector: ".elementor-widget-posts",
          slotId: "blog-archive-grid",
          node: (
            <BlogArchiveGrid
              items={items}
              title="Wpisy"
              intro="Aktualnosci, poradniki i analizy rynku biomasy w Polsce."
              currentPage={1}
              perPage={POSTS_PER_PAGE}
              basePath="/wpisy/"
            />
          ),
        },
      ]}
    />
  );
}
