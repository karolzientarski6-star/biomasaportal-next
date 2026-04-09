import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";

const SITE_URL = "https://biomasaportal.pl";
const OUTPUT_DIR = path.join(process.cwd(), "data", "wordpress");
const ROUTES_DIR = path.join(OUTPUT_DIR, "routes");

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "biomasaportal-next-export/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed ${url}: ${response.status}`);
  }

  return response.text();
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "biomasaportal-next-export/1.0",
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed ${url}: ${response.status}`);
  }

  return response.json();
}

function hash(input) {
  return createHash("sha1").update(input).digest("hex");
}

function normalizePath(url) {
  const parsed = new URL(url);
  if (parsed.pathname === "/") {
    return "/";
  }
  return parsed.pathname.endsWith("/") ? parsed.pathname : `${parsed.pathname}/`;
}

function titleFromHead($) {
  return $("title").text().trim() || "BiomasaPortal";
}

function metaDescriptionFromHead($) {
  return $('meta[name="description"]').attr("content")?.trim() ?? "";
}

async function getSitemapUrls(sitemapUrl) {
  const xml = await fetchText(sitemapUrl);
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
}

async function getAllPageUrls() {
  const sitemaps = await getSitemapUrls(`${SITE_URL}/sitemap_index.xml`);
  const allowed = [
    "page-sitemap.xml",
    "post-sitemap.xml",
    "product-sitemap.xml",
    "ogloszenie-sitemap.xml",
    "category-sitemap.xml",
    "product_cat-sitemap.xml",
    "post_tag-sitemap.xml",
    "kategoria-ogloszenia-sitemap.xml",
    "author-sitemap.xml",
  ];

  const nested = await Promise.all(
    sitemaps
      .filter((url) => allowed.some((part) => url.endsWith(part)))
      .map(getSitemapUrls),
  );

  return [...new Set(nested.flat())];
}

async function exportRoutes() {
  const urls = await getAllPageUrls();
  const manifest = [];
  const skipped = [];

  for (const url of urls) {
    try {
      const html = await fetchText(url);
      const $ = load(html);
      const body = $("body").html()?.trim() ?? html;
      const record = {
        path: normalizePath(url),
        url,
        title: titleFromHead($),
        metaDescription: metaDescriptionFromHead($),
        html: body,
        exportedAt: new Date().toISOString(),
        source: "wordpress-html",
      };
      const file = `${hash(record.path)}.json`;
      await writeFile(
        path.join(ROUTES_DIR, file),
        JSON.stringify(record, null, 2),
        "utf8",
      );
      manifest.push({
        path: record.path,
        file,
        title: record.title,
        metaDescription: record.metaDescription,
        source: record.source,
      });
    } catch (error) {
      skipped.push({
        url,
        error: String(error),
      });
    }
  }

  await writeFile(
    path.join(OUTPUT_DIR, "manifest.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        routes: manifest,
        skipped,
      },
      null,
      2,
    ),
    "utf8",
  );
}

function excerptFromRendered(rendered) {
  return rendered
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);
}

async function exportClassifieds() {
  const [posts, categories] = await Promise.all([
    fetchJson(`${SITE_URL}/wp-json/wp/v2/ogloszenie?per_page=100&_embed`),
    fetchJson(
      `${SITE_URL}/wp-json/wp/v2/kategoria-ogloszenia?per_page=100&hide_empty=false`,
    ),
  ]);

  const categoryMap = new Map(categories.map((item) => [item.id, item]));

  const normalizedPosts = posts.map((post) => {
    const featuredMedia = post._embedded?.["wp:featuredmedia"]?.[0];
    const meta = post.meta ?? {};
    const categoryNames = (post["kategoria-ogloszenia"] ?? [])
      .map((id) => categoryMap.get(id)?.name)
      .filter(Boolean);

    return {
      id: post.id,
      slug: post.slug,
      path: `/ogloszenia/${post.slug}/`,
      title: post.title?.rendered?.trim() ?? "",
      excerpt: excerptFromRendered(post.excerpt?.rendered ?? post.content?.rendered ?? ""),
      image: featuredMedia?.source_url ?? null,
      price: meta.cena ? Number(meta.cena) : null,
      location: meta.lokalizacja ?? null,
      email: meta.email ?? null,
      phone: meta.telefon ?? null,
      featured: Boolean(Number(meta.featured ?? 0)),
      viewsCount: Number(meta.views_count ?? 0),
      author: typeof post.author === "number" ? `user-${post.author}` : null,
      statusLabel: post.status === "publish" ? "Aktywne" : "Oczekuje",
      categoryNames,
    };
  });

  const normalizedCategories = categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    count: category.count,
    parent: category.parent,
  }));

  await writeFile(
    path.join(OUTPUT_DIR, "classifieds.json"),
    JSON.stringify(normalizedPosts, null, 2),
    "utf8",
  );
  await writeFile(
    path.join(OUTPUT_DIR, "classified-categories.json"),
    JSON.stringify(normalizedCategories, null, 2),
    "utf8",
  );
}

async function main() {
  await mkdir(ROUTES_DIR, { recursive: true });
  await exportRoutes();
  await exportClassifieds();
  console.log("WordPress export completed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
