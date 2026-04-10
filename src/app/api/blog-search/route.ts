import { NextResponse } from "next/server";
import { getBlogSearchIndex } from "@/lib/wordpress-export";

function foldSearchValue(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const normalizedQuery = foldSearchValue(query);
  const posts = await getBlogSearchIndex();

  const results = normalizedQuery
    ? posts.filter((post) => {
        const haystack = foldSearchValue(
          `${post.title} ${post.excerpt} ${post.path}`,
        );
        return haystack.includes(normalizedQuery);
      })
    : posts;

  return NextResponse.json({
    query: normalizedQuery,
    results: results.slice(0, 24),
  });
}
