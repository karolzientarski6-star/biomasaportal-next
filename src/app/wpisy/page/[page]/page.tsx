import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogArchiveGrid } from "@/components/blog-archive-grid";
import { MirrorTemplatePage } from "@/components/mirror-template-page";
import { extractElementorPostsWidgetSignatures } from "@/lib/elementor-posts-widget";
import { buildEditorialArchiveMetadata } from "@/lib/editorial";
import { getCombinedBlogIndex } from "@/lib/blog-index";
import { getRouteByPath } from "@/lib/wordpress-export";

const TEMPLATE_PATH = "/wpisy/";
const POSTS_PER_PAGE = 12;

type BlogArchivePaginationProps = {
  params: Promise<{ page: string }>;
};

function parsePageNumber(value: string) {
  const page = Number.parseInt(value, 10);
  return Number.isFinite(page) && page > 1 ? page : null;
}

export async function generateMetadata({
  params,
}: BlogArchivePaginationProps): Promise<Metadata> {
  const resolvedParams = await params;
  const page = parsePageNumber(resolvedParams.page);

  if (!page) {
    return {};
  }

  return buildEditorialArchiveMetadata(
    `Wpisy o biomasie - strona ${page} | BiomasaPortal`,
    "Kolejna strona archiwum wpisow BiomasaPortal o biomasie, pellecie, maszynach lesnych i dofinansowaniach.",
    `/wpisy/page/${page}/`,
  );
}

export default async function BlogArchivePaginationPage({
  params,
}: BlogArchivePaginationProps) {
  const resolvedParams = await params;
  const page = parsePageNumber(resolvedParams.page);

  if (!page) {
    notFound();
  }

  const [templateRoute, items] = await Promise.all([
    getRouteByPath(TEMPLATE_PATH),
    getCombinedBlogIndex(),
  ]);

  if (!templateRoute) {
    notFound();
  }

  const pageCount = Math.max(1, Math.ceil(items.length / POSTS_PER_PAGE));
  if (page > pageCount) {
    notFound();
  }

  const mainWidgetSignature =
    extractElementorPostsWidgetSignatures(templateRoute.html)[0] ?? null;

  return (
    <MirrorTemplatePage
      path={`/wpisy/page/${page}/`}
      route={templateRoute}
      slots={[
        {
          selector: ".elementor-widget-posts",
          slotId: "blog-archive-grid",
          node: (
            <BlogArchiveGrid
              items={items}
              currentPage={page}
              perPage={POSTS_PER_PAGE}
              basePath="/wpisy/"
              widgetSignature={mainWidgetSignature}
              showSummary={false}
              contained
            />
          ),
        },
      ]}
    />
  );
}
