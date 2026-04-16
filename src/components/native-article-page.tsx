import Link from "next/link";
import { load } from "cheerio";
import { notFound } from "next/navigation";
import {
  buildEditorialArticleMetadata,
  getEditorialArticleByPath,
  getEditorialFaqEntries,
  renderFaqAnswerHtml,
  type EditorialArticle,
} from "@/lib/editorial";
import {
  getBlogIndexByCategory,
  getBlogIndexItemByPath,
  type BlogIndexItem,
} from "@/lib/blog-index";
import { normalizeWpImageUrl } from "@/lib/html-transform";
import {
  getRouteByPath,
  readSchemaTimestamp,
  type ExportedRoute,
} from "@/lib/wordpress-export";
import { SiteShell } from "@/components/site-shell";
import { WordPressSeoScripts } from "@/components/wordpress-seo-scripts";

type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

type FaqEntry = {
  question: string;
  answerHtml: string;
};

type ArticleViewModel = {
  path: string;
  title: string;
  excerpt: string;
  heroImage: string | null;
  publishedAt: string;
  categoryName: string;
  categorySlug: string;
  contentHtml: string;
  toc: TocItem[];
  faqs: FaqEntry[];
  relatedItems: BlogIndexItem[];
  schemaJsonLd: string[];
};

const dayMonthYearFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const ABSOLUTE_SITE_URL = "https://biomasaportal.pl";

function slugifyHeading(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 64);
}

function normalizeSiteHref(href: string) {
  if (!href) {
    return href;
  }

  if (href.startsWith("//")) {
    return `https:${href}`;
  }

  if (href.startsWith(`${ABSOLUTE_SITE_URL}/wp-content/`)) {
    return href.slice(ABSOLUTE_SITE_URL.length);
  }

  if (href.startsWith(ABSOLUTE_SITE_URL)) {
    const parsed = new URL(href);
    return `${parsed.pathname}${parsed.search}${parsed.hash}` || "/";
  }

  return href;
}

function normalizeAssetUrl(src: string) {
  if (!src) {
    return src;
  }

  if (src.startsWith("//")) {
    return `https:${src}`;
  }

  if (src.startsWith(`${ABSOLUTE_SITE_URL}/wp-content/`)) {
    return src.slice(ABSOLUTE_SITE_URL.length);
  }

  return src;
}

function rewriteSrcSet(value: string) {
  return value
    .split(",")
    .map((candidate) => candidate.trim())
    .filter(Boolean)
    .map((candidate) => {
      const [url, descriptor] = candidate.split(/\s+/, 2);
      const normalizedUrl = normalizeAssetUrl(url);
      return descriptor ? `${normalizedUrl} ${descriptor}` : normalizedUrl;
    })
    .join(", ");
}

function parseFaqEntriesFromSchemas(schemaJsonLd: string[]) {
  const entries: FaqEntry[] = [];

  for (const schema of schemaJsonLd) {
    try {
      const payload = JSON.parse(schema) as {
        "@graph"?: Array<Record<string, unknown>>;
        "@type"?: string | string[];
        mainEntity?: Array<{
          name?: string;
          acceptedAnswer?: { text?: string };
        }>;
      };

      const graph = payload["@graph"] ?? [payload];
      for (const node of graph) {
        const rawType = node["@type"];
        const types = Array.isArray(rawType) ? rawType : [rawType];
        if (!types.includes("FAQPage")) {
          continue;
        }

        const mainEntity = Array.isArray(node.mainEntity) ? node.mainEntity : [];
        for (const entity of mainEntity) {
          const question = entity.name?.replace(/\s+/g, " ").trim() ?? "";
          const answerHtml = entity.acceptedAnswer?.text?.trim() ?? "";
          if (question && answerHtml) {
            entries.push({ question, answerHtml });
          }
        }
      }
    } catch {
      continue;
    }
  }

  return entries;
}

function getMainArticleHtml(route: ExportedRoute) {
  const $ = load(route.html);

  const candidates = $(".elementor-widget-text-editor")
    .map((_, element) => {
      const widget = $(element);
      const text = widget.text().replace(/\s+/g, " ").trim();
      const html = widget.find(".elementor-widget-container").html() ?? widget.html() ?? "";

      return {
        textLength: text.length,
        text,
        html,
      };
    })
    .get()
    .filter(
      (candidate) =>
        candidate.textLength > 250 &&
        !candidate.text.includes("Max Digital") &&
        !candidate.text.includes("Właściciel serwisu"),
    )
    .sort((left, right) => right.textLength - left.textLength);

  return candidates[0]?.html ?? "";
}

function prepareArticleContent(html: string) {
  const $ = load(`<div data-article-root="true">${html}</div>`);
  const toc: TocItem[] = [];

  $("script, style").remove();

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");
    if (href) {
      $(element).attr("href", normalizeSiteHref(href));
    }
  });

  $("[src]").each((_, element) => {
    const src = $(element).attr("src");
    if (src) {
      $(element).attr("src", normalizeAssetUrl(src));
    }
  });

  $("[srcset]").each((_, element) => {
    const srcSet = $(element).attr("srcset");
    if (!srcSet) {
      return;
    }

    if (srcSet.includes("/wp-content/")) {
      $(element).removeAttr("srcset");
      $(element).removeAttr("sizes");
      return;
    }

    $(element).attr("srcset", rewriteSrcSet(srcSet));
  });

  $("img").each((index, element) => {
    const image = $(element);
    image.attr("loading", index === 0 ? "eager" : "lazy");
    image.attr("decoding", "async");
  });

  $("h2, h3").each((index, element) => {
    const heading = $(element);
    const text = heading.text().replace(/\s+/g, " ").trim();

    if (!text) {
      return;
    }

    const level = heading.get(0)?.tagName === "h3" ? 3 : 2;
    const id = heading.attr("id") || `article-heading-${index}-${slugifyHeading(text)}`;
    heading.attr("id", id);
    toc.push({ id, text, level });
  });

  const root = $("[data-article-root='true']").first();
  return {
    html: root.html() ?? html,
    toc,
  };
}

function rankRelatedItems(
  items: BlogIndexItem[],
  currentPath: string,
  categorySlug: string,
) {
  return items
    .filter((item) => item.path !== currentPath)
    .sort((left, right) => {
      const leftScore = left.categorySlug === categorySlug ? 1 : 0;
      const rightScore = right.categorySlug === categorySlug ? 1 : 0;

      if (leftScore !== rightScore) {
        return rightScore - leftScore;
      }

      return right.lastModified.localeCompare(left.lastModified);
    })
    .slice(0, 3);
}

function buildEditorialArticleSchema(article: EditorialArticle) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription,
    image: article.heroImage ? [article.heroImage] : undefined,
    datePublished: article.publishedAt ?? article.scheduledFor ?? new Date().toISOString(),
    dateModified: article.publishedAt ?? article.scheduledFor ?? new Date().toISOString(),
    author: { "@type": "Organization", name: "BiomasaPortal" },
    publisher: {
      "@type": "Organization",
      name: "BiomasaPortal",
      logo: {
        "@type": "ImageObject",
        url: "https://biomasaportal.pl/wp-content/uploads/2024/01/biomasaportal.png",
      },
    },
    mainEntityOfPage: `https://biomasaportal.pl${article.path}`,
    articleSection: article.categoryName,
  });
}

function NativeArticleTemplate({
  article,
}: {
  article: ArticleViewModel;
}) {
  const heroStyle = article.heroImage
    ? {
        backgroundImage: `linear-gradient(rgba(13, 37, 27, 0.66), rgba(13, 37, 27, 0.72)), url("${article.heroImage}")`,
      }
    : undefined;

  return (
    <>
      <WordPressSeoScripts schemaJsonLd={article.schemaJsonLd} />
      <SiteShell>
        <div className="native-article-page editorial-single-post">
          <section className="article-hero" style={heroStyle} data-aos="fade-up">
            <div className="article-hero__content" data-aos="fade-right" data-aos-delay="40">
              <p className="page-card__eyebrow">{article.categoryName}</p>
              <h1>{article.title}</h1>
              <p>{article.excerpt}</p>
              <div className="article-hero__meta">
                <time dateTime={article.publishedAt}>
                  {dayMonthYearFormatter.format(new Date(article.publishedAt))}
                </time>
                <Link href={`/biomasa-w-polsce/${article.categorySlug}/`}>
                  Zobacz wiecej z tej kategorii
                </Link>
              </div>
            </div>
          </section>

          <div className="article-layout" data-aos="fade-up" data-aos-delay="60">
            <article className="article-main page-card">
              <div
                className="page-card__body mirror-html article-content"
                dangerouslySetInnerHTML={{ __html: article.contentHtml }}
              />

              {article.faqs.length > 0 ? (
                <section className="faq-section page-card__body">
                  <h2>Najczesciej zadawane pytania</h2>
                  <div className="faq-list">
                    {article.faqs.map((entry) => (
                      <details key={entry.question} className="faq-item">
                        <summary className="faq-question">{entry.question}</summary>
                        <div
                          className="faq-answer"
                          dangerouslySetInnerHTML={{
                            __html: renderFaqAnswerHtml(entry.answerHtml),
                          }}
                        />
                      </details>
                    ))}
                  </div>
                </section>
              ) : null}
            </article>

            <aside className="article-sidebar">
              {article.toc.length > 0 ? (
                <nav className="article-toc" aria-label="Spis tresci">
                  <h2 className="elementor-toc__header-title">Spis tresci</h2>
                  <ol className="elementor-toc__list-wrapper">
                    {article.toc.map((item) => (
                      <li
                        key={item.id}
                        className={`article-toc__item article-toc__item--level-${item.level}`}
                      >
                        <a href={`#${item.id}`} className="elementor-toc__list-item-text">
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              ) : null}

              {article.relatedItems.length > 0 ? (
                <section className="article-related">
                  <h2>Pozostale wpisy</h2>
                  <div className="article-related__list">
                    {article.relatedItems.map((item) => (
                      <Link key={item.id} href={item.path} className="article-related-card">
                        <div className="article-related-card__image">
                          {normalizeWpImageUrl(item.image) ? (
                            <img
                              src={normalizeWpImageUrl(item.image)!}
                              alt={item.title}
                              loading="lazy"
                              decoding="async"
                            />
                          ) : null}
                        </div>
                        <div className="article-related-card__body">
                          <p className="article-related-card__badge">{item.categoryName}</p>
                          <h3>{item.title}</h3>
                          <p>{item.excerpt}</p>
                          <span className="article-related-card__cta">Czytaj wiecej</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}
            </aside>
          </div>
        </div>
      </SiteShell>
    </>
  );
}

export async function WordPressArticlePage({
  path,
  route,
}: {
  path: string;
  route: ExportedRoute;
}) {
  const blogItem = await getBlogIndexItemByPath(path);
  const categorySlug = blogItem?.categorySlug ?? "biomasa";
  const relatedItems = await getBlogIndexByCategory(categorySlug);
  const prepared = prepareArticleContent(getMainArticleHtml(route));

  const article: ArticleViewModel = {
    path,
    title: blogItem?.title ?? route.title.replace(/\s*-\s*BiomasaPortal$/, "").trim(),
    excerpt: blogItem?.metaDescription ?? route.metaDescription,
    heroImage: normalizeWpImageUrl(route.openGraph.image),
    publishedAt: readSchemaTimestamp(route),
    categoryName: blogItem?.categoryName ?? "Biomasa",
    categorySlug,
    contentHtml: prepared.html,
    toc: prepared.toc,
    faqs: parseFaqEntriesFromSchemas(route.schemaJsonLd),
    relatedItems: rankRelatedItems(relatedItems, path, categorySlug),
    schemaJsonLd: route.schemaJsonLd,
  };

  return <NativeArticleTemplate article={article} />;
}

export async function EditorialArticlePage({ path }: { path: string }) {
  const article = await getEditorialArticleByPath(path);

  if (!article || article.publicationStatus !== "published") {
    notFound();
  }

  const relatedItems = await getBlogIndexByCategory(article.categorySlug);
  const prepared = prepareArticleContent(article.htmlContent);

  const viewModel: ArticleViewModel = {
    path,
    title: article.title,
    excerpt: article.metaDescription,
    heroImage: normalizeWpImageUrl(article.heroImage),
    publishedAt:
      article.publishedAt ?? article.scheduledFor ?? new Date().toISOString(),
    categoryName: article.categoryName,
    categorySlug: article.categorySlug,
    contentHtml: prepared.html,
    toc: prepared.toc,
    faqs: getEditorialFaqEntries(article.faqSchema),
    relatedItems: rankRelatedItems(relatedItems, path, article.categorySlug),
    schemaJsonLd: [
      buildEditorialArticleSchema(article),
      ...(article.faqSchema ? [article.faqSchema] : []),
    ],
  };

  return <NativeArticleTemplate article={viewModel} />;
}

export async function generateEditorialArticleMetadata(path: string) {
  const article = await getEditorialArticleByPath(path);

  if (!article || article.publicationStatus !== "published") {
    return {};
  }

  return buildEditorialArticleMetadata(article);
}

export async function getWordPressArticleRoute(path: string) {
  const route = await getRouteByPath(path);

  if (!route || !route.bodyClass.includes("single-post")) {
    return null;
  }

  return route;
}
