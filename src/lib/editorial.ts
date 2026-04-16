import { promises as fs } from "node:fs";
import path from "node:path";
import { cache } from "react";
import { load } from "cheerio";
import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  getEditorialCategoryBySlug,
  inferEditorialCategory,
  type EditorialCategory,
} from "@/lib/editorial-categories";

export type EditorialSeedItem = {
  order: number;
  sourceRow: number;
  keyword: string;
  title: string;
  slug: string;
  path: string;
  metaTitle: string;
  metaDescription: string;
  htmlArticle: string;
  faqSchema: string;
  imagePrompts: string;
  initialStatus: "already_published" | "queued";
};

type EditorialSeedFile = {
  sourceWorkbook: string;
  sheetName: string;
  generatedCount: number;
  items: EditorialSeedItem[];
};

export type EditorialArticleStatus = "already_published" | "published" | "queued";

export type EditorialArticleRecord = {
  id: string;
  source_row: number;
  sort_order: number;
  keyword: string;
  title: string;
  slug: string;
  path: string;
  meta_title: string;
  meta_description: string;
  html_content: string;
  faq_schema: string | null;
  image_prompts: string | null;
  publication_status: EditorialArticleStatus;
  published_at: string | null;
  scheduled_for: string | null;
  category_slug: string;
  category_name: string;
  hero_image: string | null;
  created_at: string;
  updated_at: string;
};

export type EditorialArticle = {
  id: string;
  sourceRow: number;
  order: number;
  keyword: string;
  title: string;
  slug: string;
  path: string;
  metaTitle: string;
  metaDescription: string;
  htmlContent: string;
  faqSchema: string | null;
  imagePrompts: string | null;
  publicationStatus: EditorialArticleStatus;
  publishedAt: string | null;
  scheduledFor: string | null;
  categorySlug: string;
  categoryName: string;
  heroImage: string | null;
};

type FaqEntry = {
  question: string;
  answerHtml: string;
};

const EDITORIAL_DATA_PATH = path.join(
  process.cwd(),
  "data",
  "editorial",
  "articles-seed.json",
);

const WEEKLY_PUBLICATION_BATCH_SIZE = 5;
const WEEKLY_PUBLICATION_HOUR_UTC = 7;

function safeCreateAdminClient() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return null;
  }

  return createSupabaseAdminClient();
}

function toIsoStringAtUtc(reference: Date) {
  return new Date(reference.getTime()).toISOString();
}

function getNextWeeklyPublicationDate(referenceDate = new Date()) {
  const candidate = new Date(referenceDate.getTime());
  candidate.setUTCHours(WEEKLY_PUBLICATION_HOUR_UTC, 0, 0, 0);

  const day = candidate.getUTCDay();
  const daysUntilMonday = (8 - day) % 7;
  candidate.setUTCDate(candidate.getUTCDate() + daysUntilMonday);

  if (candidate <= referenceDate) {
    candidate.setUTCDate(candidate.getUTCDate() + 7);
  }

  return candidate;
}

function computeQueuedSchedule(
  queuedArticles: Array<Pick<EditorialArticle, "sourceRow" | "order">>,
  referenceDate = new Date(),
) {
  const scheduleMap = new Map<number, string>();
  const firstPublicationDate = getNextWeeklyPublicationDate(referenceDate);

  queuedArticles
    .slice()
    .sort((left, right) => left.order - right.order)
    .forEach((article, index) => {
      const batchIndex = Math.floor(index / WEEKLY_PUBLICATION_BATCH_SIZE);
      const publicationDate = new Date(firstPublicationDate.getTime());
      publicationDate.setUTCDate(publicationDate.getUTCDate() + batchIndex * 7);
      scheduleMap.set(article.sourceRow, toIsoStringAtUtc(publicationDate));
    });

  return scheduleMap;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function extractFaqSchemaJsonLd(value: string) {
  if (!value) {
    return [];
  }

  const matches = Array.from(
    value.matchAll(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  );

  if (matches.length === 0) {
    return [value.trim()].filter(Boolean);
  }

  return matches
    .map((match) => match[1]?.trim() ?? "")
    .filter(Boolean);
}

const ABSOLUTE_SITE_URL = "https://biomasaportal.pl";

export function sanitizeEditorialHtml(html: string) {
  const $ = load(html || "");
  $("script").remove();

  // The AI-generated HTML starts with an <h1> that duplicates the article title
  // shown separately in the page template — remove it to avoid rendering it twice.
  $("h1").first().remove();

  $("img").each((index, element) => {
    const image = $(element);
    image.attr("decoding", "async");
    image.attr("loading", index === 0 ? "eager" : "lazy");

    // Normalize absolute WP URLs → relative so Vercel serves them from /public/
    const src = image.attr("src");
    if (src?.startsWith(`${ABSOLUTE_SITE_URL}/wp-content/`)) {
      image.attr("src", src.slice(ABSOLUTE_SITE_URL.length));
    }

    // Strip srcset for WP images — resized variants don't exist in /public/
    const srcset = image.attr("srcset") ?? "";
    if (srcset.includes("/wp-content/")) {
      image.removeAttr("srcset");
      image.removeAttr("sizes");
    }
  });

  return $.root().html() ?? html;
}

export function extractEditorialHeroImage(html: string) {
  const $ = load(html || "");
  const src =
    $("img").first().attr("src") ||
    $("source").first().attr("srcset")?.split(",")[0]?.trim().split(" ")[0] ||
    null;

  if (!src) {
    return null;
  }

  // Return relative path so Vercel serves the file from /public/
  if (src.startsWith(`${ABSOLUTE_SITE_URL}/wp-content/`)) {
    return src.slice(ABSOLUTE_SITE_URL.length);
  }

  // Already relative or external URL — keep as-is
  return src;
}

function mapSeedItemToArticle(seed: EditorialSeedItem): EditorialArticle {
  const category = inferEditorialCategory(seed.keyword, seed.title, seed.htmlArticle);

  return {
    id: `seed-${seed.sourceRow}`,
    sourceRow: seed.sourceRow,
    order: seed.order,
    keyword: seed.keyword,
    title: seed.title,
    slug: seed.slug,
    path: seed.path,
    metaTitle: seed.metaTitle || seed.title,
    metaDescription: seed.metaDescription,
    htmlContent: sanitizeEditorialHtml(seed.htmlArticle),
    faqSchema: extractFaqSchemaJsonLd(seed.faqSchema)[0] ?? null,
    imagePrompts: seed.imagePrompts || null,
    publicationStatus: seed.initialStatus,
    publishedAt: null,
    scheduledFor: null,
    categorySlug: category?.slug ?? "biomasa",
    categoryName: category?.name ?? "Biomasa",
    heroImage: extractEditorialHeroImage(seed.htmlArticle),
  };
}

function mapDbRecordToArticle(record: EditorialArticleRecord): EditorialArticle {
  return {
    id: record.id,
    sourceRow: record.source_row,
    order: record.sort_order,
    keyword: record.keyword,
    title: record.title,
    slug: record.slug,
    path: record.path,
    metaTitle: record.meta_title || record.title,
    metaDescription: record.meta_description,
    htmlContent: sanitizeEditorialHtml(record.html_content),
    faqSchema: record.faq_schema,
    imagePrompts: record.image_prompts,
    publicationStatus: record.publication_status,
    publishedAt: record.published_at,
    scheduledFor: record.scheduled_for,
    categorySlug: record.category_slug,
    categoryName: record.category_name,
    heroImage: record.hero_image || extractEditorialHeroImage(record.html_content),
  };
}

const readSeedFile = cache(async function readSeedFileCached() {
  try {
    const raw = await fs.readFile(EDITORIAL_DATA_PATH, "utf8");
    return JSON.parse(raw) as EditorialSeedFile;
  } catch {
    return null;
  }
});

export const getEditorialSeedArticles = cache(
  async function getEditorialSeedArticlesCached() {
    const seedFile = await readSeedFile();
    return (seedFile?.items ?? []).map(mapSeedItemToArticle);
  },
);

async function queryEditorialArticles() {
  const admin = safeCreateAdminClient();

  if (!admin) {
    return null;
  }

  const { data, error } = await admin
    .from("editorial_articles")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return null;
  }

  return (data as EditorialArticleRecord[]).map(mapDbRecordToArticle);
}

export async function getEditorialArticles() {
  noStore();

  const dbArticles = await queryEditorialArticles();

  if (dbArticles && dbArticles.length > 0) {
    return dbArticles;
  }

  return getEditorialSeedArticles();
}

export async function getEditorialArticleByPath(routePath: string) {
  const articles = await getEditorialArticles();
  return articles.find((article) => article.path === routePath) ?? null;
}

export async function getPublishedEditorialArticles() {
  const articles = await getEditorialArticles();
  return articles.filter((article) => article.publicationStatus === "published");
}

export async function getEditorialArticlesByCategory(
  categorySlug: string,
  onlyPublished = true,
) {
  const articles = await getEditorialArticles();
  return articles.filter(
    (article) =>
      article.categorySlug === categorySlug &&
      (!onlyPublished || article.publicationStatus === "published"),
  );
}

export async function getEditorialSchedulePreview(limit = 15) {
  const articles = await getEditorialArticles();
  return articles
    .filter((article) => article.publicationStatus === "queued")
    .sort((left, right) => left.order - right.order)
    .slice(0, limit);
}

export async function syncEditorialSeedToSupabase() {
  const admin = safeCreateAdminClient();

  if (!admin) {
    return {
      ok: false,
      message: "Brakuje kluczy Supabase po stronie serwera.",
    };
  }

  const seedArticles = await getEditorialSeedArticles();
  const { data: existingRows, error: existingError } = await admin
    .from("editorial_articles")
    .select("id, source_row, publication_status, published_at");

  if (existingError && existingError.code !== "PGRST205") {
    return {
      ok: false,
      message: existingError.message,
    };
  }

  const existingBySourceRow = new Map(
    ((existingRows as Array<{
      id: string;
      source_row: number;
      publication_status: EditorialArticleStatus;
      published_at: string | null;
    }>) ?? []).map((row) => [row.source_row, row]),
  );

  const articlesWithStatus = seedArticles.map((article) => {
    const existing = existingBySourceRow.get(article.sourceRow);
    const publicationStatus =
      existing?.publication_status === "published"
        ? "published"
        : existing?.publication_status === "already_published" ||
            article.publicationStatus === "already_published"
          ? "already_published"
          : "queued";

    return {
      ...article,
      publicationStatus,
      publishedAt: existing?.published_at ?? article.publishedAt,
    };
  });

  const scheduledQueue = computeQueuedSchedule(
    articlesWithStatus.filter((article) => article.publicationStatus === "queued"),
  );

  const payload = articlesWithStatus.map((article) => ({
    source_row: article.sourceRow,
    sort_order: article.order,
    keyword: article.keyword,
    title: article.title,
    slug: article.slug,
    path: article.path,
    meta_title: article.metaTitle,
    meta_description: article.metaDescription,
    html_content: article.htmlContent,
    faq_schema: article.faqSchema,
    image_prompts: article.imagePrompts,
    publication_status: article.publicationStatus,
    published_at: article.publicationStatus === "published" ? article.publishedAt : null,
    scheduled_for:
      article.publicationStatus === "queued"
        ? scheduledQueue.get(article.sourceRow) ?? null
        : null,
    category_slug: article.categorySlug,
    category_name: article.categoryName,
    hero_image: article.heroImage,
  }));

  const { error } = await admin
    .from("editorial_articles")
    .upsert(payload, { onConflict: "source_row" });

  if (error) {
    return {
      ok: false,
      message: error.message,
    };
  }

  return {
    ok: true,
    message: `Zsynchronizowano ${payload.length} rekordow z kolejka redakcyjna.`,
  };
}

async function publishRows(
  rows: Array<{ id: string }>,
  batchSize: number,
) {
  const admin = safeCreateAdminClient();

  if (!admin) {
    return {
      ok: false,
      message: "Brakuje kluczy Supabase po stronie serwera.",
      publishedCount: 0,
    };
  }

  if (rows.length === 0) {
    return {
      ok: true,
      message: "Brak kolejnych wpisow do publikacji.",
      publishedCount: 0,
    };
  }

  const ids = rows.slice(0, batchSize).map((item) => item.id);
  const publishedAt = new Date().toISOString();
  const { error: updateError } = await admin
    .from("editorial_articles")
    .update({
      publication_status: "published",
      published_at: publishedAt,
      scheduled_for: null,
    })
    .in("id", ids);

  if (updateError) {
    return {
      ok: false,
      message: updateError.message,
      publishedCount: 0,
    };
  }

  const { data: remainingQueued } = await admin
    .from("editorial_articles")
    .select("id, source_row, sort_order")
    .eq("publication_status", "queued")
    .order("sort_order", { ascending: true });

  if (remainingQueued && remainingQueued.length > 0) {
    const nextSchedule = computeQueuedSchedule(
      remainingQueued.map((row) => ({
        sourceRow: row.source_row,
        order: row.sort_order,
      })),
    );

    await Promise.all(
      remainingQueued.map((row) =>
        admin
          .from("editorial_articles")
          .update({ scheduled_for: nextSchedule.get(row.source_row) ?? null })
          .eq("id", row.id),
      ),
    );
  }

  return {
    ok: true,
    message: `Opublikowano ${ids.length} kolejnych wpisow z kolejki.`,
    publishedCount: ids.length,
  };
}

export async function publishNextEditorialBatch(batchSize = WEEKLY_PUBLICATION_BATCH_SIZE) {
  const admin = safeCreateAdminClient();

  if (!admin) {
    return {
      ok: false,
      message: "Brakuje kluczy Supabase po stronie serwera.",
      publishedCount: 0,
    };
  }

  const { data: queued, error: queueError } = await admin
    .from("editorial_articles")
    .select("id")
    .eq("publication_status", "queued")
    .order("sort_order", { ascending: true })
    .limit(batchSize);

  if (queueError) {
    return {
      ok: false,
      message: queueError.message,
      publishedCount: 0,
    };
  }

  return publishRows(queued ?? [], batchSize);
}

export async function publishScheduledEditorialBatch(
  batchSize = WEEKLY_PUBLICATION_BATCH_SIZE,
) {
  const admin = safeCreateAdminClient();

  if (!admin) {
    return {
      ok: false,
      message: "Brakuje kluczy Supabase po stronie serwera.",
      publishedCount: 0,
    };
  }

  const { data: queued, error: queueError } = await admin
    .from("editorial_articles")
    .select("id")
    .eq("publication_status", "queued")
    .lte("scheduled_for", new Date().toISOString())
    .order("scheduled_for", { ascending: true })
    .order("sort_order", { ascending: true })
    .limit(batchSize);

  if (queueError) {
    return {
      ok: false,
      message: queueError.message,
      publishedCount: 0,
    };
  }

  return publishRows(queued ?? [], batchSize);
}

function parseFaqEntriesFromNode(node: unknown): FaqEntry[] {
  if (!node || typeof node !== "object") {
    return [];
  }

  const payload = node as {
    "@graph"?: unknown[];
    "@type"?: string | string[];
    mainEntity?: Array<{
      name?: string;
      acceptedAnswer?: { text?: string };
    }>;
  };

  if (Array.isArray(payload["@graph"])) {
    return payload["@graph"].flatMap((entry) => parseFaqEntriesFromNode(entry));
  }

  const rawType = payload["@type"];
  const types = Array.isArray(rawType) ? rawType : [rawType];

  if (!types.includes("FAQPage")) {
    return [];
  }

  return (payload.mainEntity ?? [])
    .map((entry) => ({
      question: entry.name?.replace(/\s+/g, " ").trim() ?? "",
      answerHtml: entry.acceptedAnswer?.text?.trim() ?? "",
    }))
    .filter((entry) => entry.question && entry.answerHtml);
}

export function getEditorialFaqEntries(schemaJsonLd: string | null) {
  if (!schemaJsonLd) {
    return [];
  }

  try {
    const parsed = JSON.parse(schemaJsonLd) as unknown;
    return parseFaqEntriesFromNode(parsed);
  } catch {
    return [];
  }
}

export function getEditorialCategoryForArticle(article: EditorialArticle) {
  return getEditorialCategoryBySlug(article.categorySlug) as EditorialCategory | null;
}

export function buildEditorialArticleMetadata(article: EditorialArticle): Metadata {
  const canonicalUrl = `https://biomasaportal.pl${article.path}`;

  return {
    title: article.metaTitle || article.title,
    description: article.metaDescription || undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: article.metaTitle || article.title,
      description: article.metaDescription || undefined,
      type: "article",
      url: canonicalUrl,
      images: article.heroImage ? [article.heroImage] : undefined,
      siteName: "BiomasaPortal",
      locale: "pl_PL",
    },
    twitter: {
      card: article.heroImage ? "summary_large_image" : "summary",
      title: article.metaTitle || article.title,
      description: article.metaDescription || undefined,
      images: article.heroImage ? [article.heroImage] : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function buildEditorialArchiveMetadata(
  title: string,
  description: string,
  pathName: string,
) {
  const canonicalUrl = `https://biomasaportal.pl${pathName}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: "website" as const,
      url: canonicalUrl,
      siteName: "BiomasaPortal",
      locale: "pl_PL",
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function renderFaqAnswerHtml(answerHtml: string) {
  if (!answerHtml) {
    return "";
  }

  const trimmed = answerHtml.trim();
  if (trimmed.startsWith("<")) {
    return trimmed;
  }

  return `<p>${escapeHtml(trimmed)}</p>`;
}
