import type { Metadata } from "next";
import { NativeHomePage } from "@/components/native-home-page";
import { getCombinedBlogIndex } from "@/lib/blog-index";
import { EDITORIAL_CATEGORIES } from "@/lib/editorial-categories";
import {
  buildRouteMetadata,
  getClassifieds,
  getRouteByPath,
} from "@/lib/wordpress-export";

/**
 * Legacy duplicate of the homepage kept for URL parity with the old WP install.
 * We keep the page reachable but noindex it and point canonical back to "/".
 */
export async function generateMetadata(): Promise<Metadata> {
  const route = await getRouteByPath("/");

  if (!route) {
    return {
      robots: { index: false, follow: false },
    };
  }

  return {
    ...buildRouteMetadata(route),
    alternates: {
      canonical: "/",
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function BiomassPortalLegacyPage() {
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
