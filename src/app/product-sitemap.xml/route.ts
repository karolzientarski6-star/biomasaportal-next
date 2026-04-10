import { buildSitemapUrlSet, getProductSitemapEntries } from "@/lib/sitemap";

export async function GET() {
  const entries = await getProductSitemapEntries();

  return new Response(buildSitemapUrlSet(entries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
