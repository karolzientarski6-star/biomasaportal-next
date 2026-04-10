import { NextResponse } from "next/server";
import { getCombinedBlogIndex } from "@/lib/blog-index";

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
  const variants = new Set([
    queryToken,
    queryToken.slice(0, Math.max(queryToken.length - 1, 1)),
    queryToken.slice(0, Math.min(queryToken.length, 5)),
  ]);

  return haystackTokens.some((token) =>
    [...variants].some(
      (variant) =>
        variant.length > 0 &&
        (token.includes(variant) || variant.includes(token)),
    ),
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const normalizedQuery = foldSearchValue(query);
  const queryTokens = tokenize(query);
  const posts = await getCombinedBlogIndex();

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
