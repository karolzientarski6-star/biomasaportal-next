import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentArchivePage } from "@/components/content-archive-page";
import { buildEditorialArchiveMetadata } from "@/lib/editorial";
import { getCombinedBlogIndex } from "@/lib/blog-index";

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

  const items = await getCombinedBlogIndex();

  const pageCount = Math.max(1, Math.ceil(items.length / POSTS_PER_PAGE));
  if (page > pageCount) {
    notFound();
  }

  return (
    <ContentArchivePage
      eyebrow="BiomasaPortal"
      title={`Wpisy - strona ${page}`}
      intro="Kolejna strona archiwum publikacji o biomase, pellecie, biogazie i technologiach grzewczych."
      items={items}
      currentPage={page}
      perPage={POSTS_PER_PAGE}
      basePath="/wpisy/"
    />
  );
}
