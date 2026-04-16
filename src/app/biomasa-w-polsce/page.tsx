import type { Metadata } from "next";
import { EditorialCategoryHub } from "@/components/editorial-category-hub";
import { SiteShell } from "@/components/site-shell";
import { buildEditorialArchiveMetadata } from "@/lib/editorial";
import { getCombinedBlogIndex } from "@/lib/blog-index";
import { EDITORIAL_CATEGORIES } from "@/lib/editorial-categories";

export async function generateMetadata(): Promise<Metadata> {
  return buildEditorialArchiveMetadata(
    "Biomasa w Polsce - kategorie wpisow i analizy | BiomasaPortal",
    "Hub tresci BiomasaPortal: pellet, dofinansowania, biogazownie, maszyny lesne, piece i rynek biomasy w Polsce.",
    "/biomasa-w-polsce/",
  );
}

export default async function BiomasaInPolandPage() {
  const items = await getCombinedBlogIndex();

  const categories = EDITORIAL_CATEGORIES.map((category) => ({
    category,
    totalPosts: items.filter((item) => item.categorySlug === category.slug).length,
    latestPosts: items.filter((item) => item.categorySlug === category.slug).slice(0, 2),
  }));

  return (
    <SiteShell>
      <EditorialCategoryHub categories={categories} latestItems={items} />
    </SiteShell>
  );
}
