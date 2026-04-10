import { buildSitemapUrlSet, getPageSitemapEntries } from "@/lib/sitemap";

export async function GET() {
  const entries = await getPageSitemapEntries();

  return new Response(buildSitemapUrlSet(entries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
