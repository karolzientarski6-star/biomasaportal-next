import { buildSitemapUrlSet, getPostSitemapEntries } from "@/lib/sitemap";

export async function GET() {
  const entries = await getPostSitemapEntries();

  return new Response(buildSitemapUrlSet(entries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
