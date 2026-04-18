import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditorialCategoryHub } from "@/components/editorial-category-hub";
import { NativePublicPageFrame } from "@/components/native-public-page-frame";
import { buildEditorialArchiveMetadata } from "@/lib/editorial";
import { getCombinedBlogIndex } from "@/lib/blog-index";
import { EDITORIAL_CATEGORIES } from "@/lib/editorial-categories";
import { getRouteByPath } from "@/lib/wordpress-export";

const TEMPLATE_PATH = "/wpisy/";

export async function generateMetadata(): Promise<Metadata> {
  return buildEditorialArchiveMetadata(
    "Biomasa w Polsce - kategorie wpisow i analizy | BiomasaPortal",
    "Hub tresci BiomasaPortal: pellet, dofinansowania, biogazownie, maszyny lesne, piece i rynek biomasy w Polsce.",
    "/biomasa-w-polsce/",
  );
}

export default async function BiomasaInPolandPage() {
  const [templateRoute, items] = await Promise.all([
    getRouteByPath(TEMPLATE_PATH),
    getCombinedBlogIndex(),
  ]);

  if (!templateRoute) {
    notFound();
  }

  const categories = EDITORIAL_CATEGORIES.map((category) => ({
    category,
    totalPosts: items.filter((item) => item.categorySlug === category.slug).length,
    latestPosts: items.filter((item) => item.categorySlug === category.slug).slice(0, 2),
  }));

  return (
    <NativePublicPageFrame path="/biomasa-w-polsce/" route={templateRoute}>
      <EditorialCategoryHub categories={categories} latestItems={items} />
    </NativePublicPageFrame>
  );
}
