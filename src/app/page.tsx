import type { Metadata } from "next";
import { NativeHomePage } from "@/components/native-home-page";
import { getCombinedBlogIndex } from "@/lib/blog-index";
import { EDITORIAL_CATEGORIES } from "@/lib/editorial-categories";
import { buildRouteMetadata, getRouteByPath } from "@/lib/wordpress-export";
import { getClassifieds } from "@/lib/wordpress-export";

export async function generateMetadata(): Promise<Metadata> {
  const route = await getRouteByPath("/");

  if (!route) {
    return {};
  }

  const metadata = buildRouteMetadata(route);

  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical: "/",
    },
  };
}

export default async function HomePage() {
  const [latestPosts, classifieds] = await Promise.all([
    getCombinedBlogIndex(),
    getClassifieds(),
  ]);

  const categories = EDITORIAL_CATEGORIES.map((category) => ({
    category,
    totalPosts: latestPosts.filter((item) => item.categorySlug === category.slug).length,
    latestPosts: latestPosts
      .filter((item) => item.categorySlug === category.slug)
      .slice(0, 1),
  }));

  return (
    <NativeHomePage
      latestPosts={latestPosts}
      categories={categories}
      classifieds={classifieds}
    />
  );
}
