import type { Metadata } from "next";
import { ContentArchivePage } from "@/components/content-archive-page";
import { getCombinedBlogIndex } from "@/lib/blog-index";
import { buildRouteMetadata, getRouteByPath } from "@/lib/wordpress-export";

const POSTS_PER_PAGE = 12;

export async function generateMetadata(): Promise<Metadata> {
  const route = await getRouteByPath("/wpisy/");
  return route ? buildRouteMetadata(route) : {};
}

export default async function BlogArchivePage() {
  const items = await getCombinedBlogIndex();

  return (
    <ContentArchivePage
      eyebrow="BiomasaPortal"
      title="Wpisy"
      intro="Archiwum publikacji o pellecie, biogazie, dofinansowaniach, maszynach lesnych i rynku biomasy w Polsce."
      items={items}
      currentPage={1}
      perPage={POSTS_PER_PAGE}
      basePath="/wpisy/"
    />
  );
}
