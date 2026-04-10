import {
  buildSitemapUrlSet,
  getClassifiedCategorySitemapEntries,
} from "@/lib/sitemap";

export async function GET() {
  const entries = await getClassifiedCategorySitemapEntries();

  return new Response(buildSitemapUrlSet(entries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
