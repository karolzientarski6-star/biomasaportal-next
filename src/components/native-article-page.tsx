import Link from "next/link";
import { load } from "cheerio";
import { NativePublicPageFrame } from "@/components/native-public-page-frame";
import { getBlogIndexItemByPath, getCombinedBlogIndex } from "@/lib/blog-index";
import {
  extractFaqSchemaJsonLd,
  getEditorialArticleByPath,
  getEditorialFaqEntries,
  renderFaqAnswerHtml,
  type EditorialArticle,
} from "@/lib/editorial";
import {
  getOptimizedWpImageByHints,
  getOptimizedWpImageUrl,
} from "@/lib/wp-image-variants";
import {
  getRouteByPath,
  readSchemaArticleSections,
  readSchemaTimestamp,
  type ExportedRoute,
} from "@/lib/wordpress-export";
import { mapWordPressSectionToEditorialCategory } from "@/lib/editorial-categories";

type NativeArticlePageProps = {
  path: string;
  route?: ExportedRoute | null;
  editorialArticle?: EditorialArticle | null;
};

type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

type FaqEntry = {
  question: string;
  answerHtml: string;
};

type ArticleRenderModel = {
  title: string;
  path: string;
  intro: string;
  htmlContent: string;
  tocItems: TocItem[];
  faqEntries: FaqEntry[];
  categoryLabel: string;
  publishedAtLabel: string | null;
  readingTimeLabel: string;
  featuredImage: string | null;
  schemaJsonLd: string[];
  frameRoute: ExportedRoute | null;
};

function buildFeaturedOverlayStyle(featuredImage: string | null) {
  if (!featuredImage) {
    return undefined;
  }

  return {
    backgroundImage: `linear-gradient(rgba(11, 25, 19, 0.58), rgba(11, 25, 19, 0.58)), url("${featuredImage}")`,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  } as const;
}

function stripSiteSuffix(title: string) {
  return title.replace(/\s*-\s*BiomasaPortal\s*$/i, "").trim();
}

function cleanRelatedExcerpt(value: string) {
  return value
    .replace(/^\s*spis\s+tre(?:s|ś|ci)\b[:\s-]*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function slugifyHeading(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function formatPublishedDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function estimateReadingTimeLabel(html: string) {
  const text = load(`<div>${html}</div>`)("body").text().replace(/\s+/g, " ").trim();
  const wordCount = text ? text.split(" ").filter(Boolean).length : 0;
  const minutes = Math.max(1, Math.ceil(wordCount / 180));
  return `${minutes} min czytania`;
}

function buildArticleSchema(article: EditorialArticle) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription,
    image: article.heroImage ? [article.heroImage] : undefined,
    datePublished:
      article.publishedAt ?? article.scheduledFor ?? new Date().toISOString(),
    dateModified:
      article.publishedAt ?? article.scheduledFor ?? new Date().toISOString(),
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

function sanitizeArticleHtml(html: string) {
  const $ = load(`<div class="native-article-html-root">${html}</div>`);

  $("script, style").remove();
  $(".native-article-html-root h1").remove();
  $(".faq-container, .faq-section").remove();

  $(".faq-item").each((_, element) => {
    const question = $(element).find(".faq-question").first();
    const answer = $(element).find(".faq-answer").first();

    if (question.length && answer.length) {
      $(element).remove();
    }
  });

  return $(".native-article-html-root").html() ?? html;
}

function buildArticleContentModel(html: string) {
  const sanitizedHtml = sanitizeArticleHtml(html);
  const $ = load(`<div class="native-article-html-root">${sanitizedHtml}</div>`);
  const usedIds = new Set<string>();
  const tocItems: TocItem[] = [];

  $(".native-article-html-root h2, .native-article-html-root h3").each((_, element) => {
    const heading = $(element);
    const text = heading.text().replace(/\s+/g, " ").trim();

    if (!text) {
      return;
    }

    const level = heading.is("h3") ? 3 : 2;
    let id = heading.attr("id") || slugifyHeading(text) || `sekcja-${tocItems.length + 1}`;

    while (usedIds.has(id)) {
      id = `${id}-${tocItems.length + 1}`;
    }

    usedIds.add(id);
    heading.attr("id", id);
    tocItems.push({ id, text, level });
  });

  return {
    htmlContent: $(".native-article-html-root").html() ?? sanitizedHtml,
    tocItems,
  };
}

function extractWordPressArticle(route: ExportedRoute): ArticleRenderModel {
  const $ = load(route.html);
  const articleRoot = $("[data-elementor-post-type='post']").first();
  const title =
    articleRoot
      .find(".elementor-widget-heading .elementor-heading-title")
      .first()
      .text()
      .replace(/\s+/g, " ")
      .trim() || stripSiteSuffix(route.title);

  const contentBlocks = articleRoot
    .find(".elementor-widget-text-editor")
    .filter((_, element) => {
      const text = $(element).text().replace(/\s+/g, " ").trim();
      return Boolean(text) && !text.includes("Max Digital");
    })
    .map((_, element) => {
      const widget = $(element);
      const container = widget.find(".elementor-widget-container").first();

      return container.length ? container.html() ?? "" : widget.html() ?? "";
    })
    .get()
    .filter(Boolean);

  const intro = articleRoot
    .find(".elementor-widget-text-editor p")
    .first()
    .text()
    .replace(/\s+/g, " ")
    .trim();
  const schemaSections = readSchemaArticleSections(route);
  const categoryLabel =
    schemaSections
      .map((section) => mapWordPressSectionToEditorialCategory(section))
      .find(Boolean)?.name ??
    schemaSections[0] ??
    "Biomasa";
  const contentModel = buildArticleContentModel(contentBlocks.join(""));

  return {
    title,
    path: route.path,
    intro: intro || route.metaDescription || "",
    htmlContent: contentModel.htmlContent,
    tocItems: contentModel.tocItems,
    faqEntries: [],
    categoryLabel,
    publishedAtLabel: formatPublishedDate(readSchemaTimestamp(route)),
    readingTimeLabel: estimateReadingTimeLabel(contentModel.htmlContent),
    featuredImage: route.openGraph.image || null,
    schemaJsonLd: route.schemaJsonLd,
    frameRoute: route,
  };
}

function extractEditorialArticle(
  article: EditorialArticle,
  frameRoute: ExportedRoute | null,
): ArticleRenderModel {
  const faqEntries = getEditorialFaqEntries(article.faqSchema);
  const contentModel = buildArticleContentModel(article.htmlContent);

  return {
    title: article.title,
    path: article.path,
    intro: article.metaDescription,
    htmlContent: contentModel.htmlContent,
    tocItems: contentModel.tocItems,
    faqEntries,
    categoryLabel: article.categoryName,
    publishedAtLabel: formatPublishedDate(
      article.publishedAt ?? article.scheduledFor ?? null,
    ),
    readingTimeLabel: estimateReadingTimeLabel(contentModel.htmlContent),
    featuredImage: article.heroImage,
    schemaJsonLd: [
      buildArticleSchema(article),
      ...extractFaqSchemaJsonLd(article.faqSchema ?? ""),
    ],
    frameRoute,
  };
}

function buildRelatedPosts(
  currentPath: string,
  categoryLabel: string,
  items: Awaited<ReturnType<typeof getCombinedBlogIndex>>,
) {
  const currentItem = items.find((item) => item.path === currentPath);
  const categorySlug = currentItem?.categorySlug ?? null;
  const sameCategory = items.filter(
    (item) => item.path !== currentPath && (!categorySlug || item.categorySlug === categorySlug),
  );
  const fallback = items.filter(
    (item) =>
      item.path !== currentPath &&
      !sameCategory.some((candidate) => candidate.path === item.path),
  );

  return [...sameCategory, ...fallback].slice(0, 4).map((item) => ({
    ...item,
    excerpt: cleanRelatedExcerpt(item.excerpt || item.title),
    image:
      getOptimizedWpImageUrl(item.image, 480) ||
      getOptimizedWpImageByHints([item.title, item.path, categoryLabel], 480),
  }));
}

export async function NativeArticlePage({
  path,
  route: providedRoute,
  editorialArticle: providedEditorialArticle,
}: NativeArticlePageProps) {
  const [route, editorialArticle, blogItems, currentIndexItem, singleTemplateRoute] =
    await Promise.all([
      providedRoute ? Promise.resolve(providedRoute) : getRouteByPath(path),
      providedEditorialArticle
        ? Promise.resolve(providedEditorialArticle)
        : getEditorialArticleByPath(path),
      getCombinedBlogIndex(),
      getBlogIndexItemByPath(path),
      getRouteByPath("/cena-zrebki-drzewnej-2026/"),
    ]);

  const model =
    route?.bodyClass.includes("single-post")
      ? extractWordPressArticle(route)
      : editorialArticle?.publicationStatus === "published"
        ? extractEditorialArticle(editorialArticle, singleTemplateRoute)
        : null;

  if (!model) {
    return null;
  }

  const relatedPosts = buildRelatedPosts(
    path,
    currentIndexItem?.categoryName ?? model.categoryLabel,
    blogItems,
  );
  const frameRoute = model.frameRoute;

  return (
    <NativePublicPageFrame
      path={path}
      route={frameRoute}
      bodyClass={
        frameRoute?.bodyClass ?? "single single-post editorial-single-post"
      }
      stylesheets={frameRoute?.stylesheets ?? []}
      schemaJsonLd={model.schemaJsonLd}
      featuredImage={model.featuredImage}
      isSinglePost
    >
      <article className="editorial-single-post native-article-page">
        <header className="native-article-page__hero native-article-page__hero--bleed">
          <div className="native-article-page__hero-inner native-article-page__hero-inner--compact">
            <p className="native-article-page__eyebrow">{model.categoryLabel}</p>
            <span className="native-article-page__hero-title">{model.title}</span>
            <div className="editorial-post-meta native-article-page__meta">
              {model.publishedAtLabel ? <span>{model.publishedAtLabel}</span> : null}
              <span>{model.readingTimeLabel}</span>
            </div>
          </div>
        </header>

        <section className="editorial-post-layout native-article-page__layout native-article-page__container">
          <div className="e-con-inner">
            <div className="editorial-post-main">
              {model.tocItems.length ? (
                <section className="elementor-widget elementor-widget-table-of-contents native-article-page__toc">
                  <div
                    className="elementor-widget-container"
                    style={buildFeaturedOverlayStyle(model.featuredImage)}
                  >
                    <div className="elementor-toc__header">
                      <h2 className="elementor-toc__header-title">Spis treści</h2>
                    </div>
                    <div className="elementor-toc__body">
                      <ol className="elementor-toc__list-wrapper">
                        {model.tocItems.map((item) => (
                          <li
                            key={item.id}
                            className={`elementor-toc__list-item elementor-toc__list-item--${item.level}`}
                          >
                            <a className="elementor-toc__list-item-text" href={`#${item.id}`}>
                              {item.text}
                            </a>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </section>
              ) : null}

              <div className="native-article-page__content">
                <header className="native-article-page__content-header">
                  <h1>{model.title}</h1>
                </header>
                <div
                  className="native-article-page__content-html"
                  dangerouslySetInnerHTML={{ __html: model.htmlContent }}
                />

                {model.faqEntries.length ? (
                  <section className="faq-section native-article-page__faq">
                    <h2>Najczęściej zadawane pytania</h2>
                    <div className="faq-list">
                      {model.faqEntries.map((entry) => (
                        <details key={entry.question} className="faq-item">
                          <summary className="faq-question">
                            <span>{entry.question}</span>
                          </summary>
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
              </div>
            </div>

            <aside className="native-article-page__sidebar">
              <section className="elementor-widget elementor-widget-posts editorial-sidebar-posts">
                <h3>Pozostałe wpisy</h3>
                <div className="elementor-posts-container" role="list">
                  {relatedPosts.map((item) => {
                    const image =
                      item.image ||
                      getOptimizedWpImageByHints(
                        [item.title, item.path, item.categoryName],
                        480,
                      );

                    return (
                      <article
                        key={item.path}
                        className="elementor-post elementor-grid-item"
                        role="listitem"
                      >
                        <div className="elementor-post__card">
                          {image ? (
                            <Link
                              href={item.path}
                              className="elementor-post__thumbnail__link"
                              tabIndex={-1}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={image}
                                alt={item.title}
                                loading="lazy"
                                decoding="async"
                              />
                            </Link>
                          ) : null}
                          <div className="elementor-post__text">
                            <h4 className="elementor-post__title">
                              <Link href={item.path}>{item.title}</Link>
                            </h4>
                            <div className="elementor-post__excerpt">
                              <p>{item.excerpt}</p>
                            </div>
                            <div className="elementor-post__read-more-wrapper">
                              <Link className="elementor-post__read-more" href={item.path}>
                                Czytaj więcej »
                              </Link>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            </aside>
          </div>
        </section>
      </article>
    </NativePublicPageFrame>
  );
}
