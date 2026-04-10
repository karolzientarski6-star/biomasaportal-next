import { buildSitemapUrlSet, getClassifiedSitemapEntries } from "@/lib/sitemap";

export async function GET() {
  const entries = await getClassifiedSitemapEntries();

  return new Response(buildSitemapUrlSet(entries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
