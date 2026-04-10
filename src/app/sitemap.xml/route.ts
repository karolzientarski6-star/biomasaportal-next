import { buildSitemapIndex, getSitemapIndexEntries } from "@/lib/sitemap";

export async function GET() {
  const entries = await getSitemapIndexEntries();

  return new Response(buildSitemapIndex(entries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
