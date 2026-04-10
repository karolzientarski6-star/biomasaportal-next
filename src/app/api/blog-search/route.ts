import { NextResponse } from "next/server";
import { getPublishedEditorialArticles } from "@/lib/editorial";
import { getBlogSearchIndex } from "@/lib/wordpress-export";

type SearchIndexItem = {
  path: string;
  title: string;
  excerpt: string;
  image: string | null;
  lastModified: string;
};

const SEARCH_INDEX_TTL_MS = 10 * 60 * 1000;

let searchIndexCache:
  | {
      expiresAt: number;
      items: SearchIndexItem[];
    }
  | null = null;

function foldSearchValue(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function tokenize(value: string) {
  return foldSearchValue(value)
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function tokenMatches(haystackTokens: string[], queryToken: string) {
  const normalizedToken = queryToken.trim();

  if (!normalizedToken) {
    return false;
  }

  const variants = new Set([normalizedToken]);

  if (normalizedToken.length >= 5) {
    variants.add(normalizedToken.slice(0, normalizedToken.length - 1));
  }

  if (normalizedToken.length >= 7) {
    variants.add(normalizedToken.slice(0, 5));
  }

  return haystackTokens.some((token) =>
    [...variants].some(
      (variant) =>
        variant.length >= 4 &&
        (token === variant ||
          token.startsWith(variant) ||
          token.includes(variant)),
    ),
  );
}

async function getSearchIndex() {
  if (searchIndexCache && searchIndexCache.expiresAt > Date.now()) {
    return searchIndexCache.items;
  }

  const [wordpressPosts, editorialPosts] = await Promise.all([
    getBlogSearchIndex(),
    getPublishedEditorialArticles(),
  ]);

  const items = [
    ...editorialPosts.map((article) => ({
      path: article.path,
      title: article.title,
      excerpt: article.metaDescription,
      image: article.heroImage,
      lastModified: article.publishedAt ?? article.scheduledFor ?? "",
    })),
    ...wordpressPosts,
  ].sort((left, right) => right.lastModified.localeCompare(left.lastModified));

  searchIndexCache = {
    items,
    expiresAt: Date.now() + SEARCH_INDEX_TTL_MS,
  };

  return items;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const shouldWarm = searchParams.get("warm") === "1";
  const normalizedQuery = foldSearchValue(query);
  const queryTokens = tokenize(query);
  const posts = await getSearchIndex();

  if (shouldWarm) {
    return NextResponse.json({
      ok: true,
      totalResults: posts.length,
    });
  }

  const filteredResults = normalizedQuery
    ? posts.filter((post) => {
        const haystack = `${post.title} ${post.excerpt} ${post.path}`;
        const foldedHaystack = foldSearchValue(haystack);
        const haystackTokens = tokenize(haystack);

        if (foldedHaystack.includes(normalizedQuery)) {
          return true;
        }

        return queryTokens.every((token) => tokenMatches(haystackTokens, token));
      })
    : posts;

  return NextResponse.json({
    query,
    normalizedQuery,
    totalResults: filteredResults.length,
    results: filteredResults.slice(0, 24),
  });
}
