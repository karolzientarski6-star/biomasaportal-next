import { unstable_noStore as noStore } from "next/cache";
import { load } from "cheerio";
import { getPublishedEditorialArticles } from "@/lib/editorial";
import {
  getBlogSearchIndex,
  getRouteByPath,
  readSchemaArticleSections,
  readSchemaTimestamp,
  type ExportedRoute,
} from "@/lib/wordpress-export";
import {
  getEditorialCategoryBySlug,
  inferEditorialCategory,
  mapWordPressSectionToEditorialCategory,
} from "@/lib/editorial-categories";

export type BlogIndexItem = {
  id: string;
  source: "wordpress" | "editorial";
  path: string;
  title: string;
  excerpt: string;
  image: string | null;
  canonicalUrl: string;
  lastModified: string;
  metaDescription: string;
  categorySlug: string;
  categoryName: string;
};

function excerptFromRoute(route: ExportedRoute) {
  if (route.metaDescription) {
    return route.metaDescription;
  }

  const $ = load(route.html);
  return (
    $(".elementor-widget-text-editor p").first().text().replace(/\s+/g, " ").trim().slice(0, 220)
  );
}

async function mapWordPressPost(item: Awaited<ReturnType<typeof getBlogSearchIndex>>[number]) {
  const route = await getRouteByPath(item.path);
  const schemaCategory = route
    ? readSchemaArticleSections(route)
        .map((section) => mapWordPressSectionToEditorialCategory(section))
        .find(Boolean) ?? null
    : null;
  const category =
    schemaCategory ??
    inferEditorialCategory(
      item.title,
      item.title,
      `${item.excerpt} ${route?.html ?? ""}`,
    );

  return {
    id: `wordpress:${item.path}`,
    source: "wordpress" as const,
    path: item.path,
    title: item.title,
    excerpt: route ? excerptFromRoute(route) : item.excerpt,
    image: item.image,
    canonicalUrl: item.canonicalUrl,
    lastModified: route ? readSchemaTimestamp(route) : item.lastModified,
    metaDescription: route?.metaDescription || item.excerpt,
    categorySlug: category?.slug ?? "biomasa",
    categoryName: category?.name ?? "Biomasa",
  };
}

export async function getCombinedBlogIndex() {
  noStore();

  const [wordpressPosts, editorialPosts] = await Promise.all([
    getBlogSearchIndex(),
    getPublishedEditorialArticles(),
  ]);

  const mappedWordPress = await Promise.all(wordpressPosts.map(mapWordPressPost));
  const mappedEditorial = editorialPosts.map((article) => ({
    id: article.id,
    source: "editorial" as const,
    path: article.path,
    title: article.title,
    excerpt: article.metaDescription,
    image: article.heroImage,
    canonicalUrl: `https://biomasaportal.pl${article.path}`,
    lastModified: article.publishedAt ?? article.scheduledFor ?? new Date().toISOString(),
    metaDescription: article.metaDescription,
    categorySlug: article.categorySlug,
    categoryName:
      getEditorialCategoryBySlug(article.categorySlug)?.name ?? article.categoryName,
  }));

  return [...mappedEditorial, ...mappedWordPress].sort((left, right) =>
    right.lastModified.localeCompare(left.lastModified),
  );
}

export async function getBlogIndexItemByPath(routePath: string) {
  const items = await getCombinedBlogIndex();
  return items.find((item) => item.path === routePath) ?? null;
}

export async function getBlogIndexByCategory(categorySlug: string) {
  const items = await getCombinedBlogIndex();
  return items.filter((item) => item.categorySlug === categorySlug);
}
