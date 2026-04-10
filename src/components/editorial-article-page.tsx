import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { injectHtmlSlots, transformExportedHtml } from "@/lib/html-transform";
import {
  getEditorialArticleByPath,
  getEditorialCategoryForArticle,
  getEditorialFaqEntries,
  renderFaqAnswerHtml,
  type EditorialArticle,
} from "@/lib/editorial";
import { getCombinedBlogIndex } from "@/lib/blog-index";
import { getRouteByPath } from "@/lib/wordpress-export";
import { WordPressAssets } from "@/components/wordpress-assets";
import { WordPressBodyClass } from "@/components/wordpress-body-class";
import { WordPressInteractiveEnhancer } from "@/components/wordpress-interactive-enhancer";
import { WordPressSeoScripts } from "@/components/wordpress-seo-scripts";

const TEMPLATE_ROUTE_PATH =
  "/dofinansowanie-do-pieca-na-pellet-czyste-powietrze-2026-warunki-i-kwoty/";

function splitHtmlBySlot(html: string, slotId: string) {
  const marker = `<div data-next-slot="${slotId}"></div>`;
  const markerIndex = html.indexOf(marker);

  if (markerIndex === -1) {
    return [html];
  }

  const before = html.slice(0, markerIndex);
  const after = html.slice(markerIndex + marker.length);

  return [before, after];
}

function buildArticleSchema(article: EditorialArticle) {
  const category = getEditorialCategoryForArticle(article);

  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription,
    image: article.heroImage ? [article.heroImage] : undefined,
    datePublished: article.publishedAt ?? article.scheduledFor ?? new Date().toISOString(),
    dateModified: article.publishedAt ?? article.scheduledFor ?? new Date().toISOString(),
    author: {
      "@type": "Organization",
      name: "BiomasaPortal",
    },
    publisher: {
      "@type": "Organization",
      name: "BiomasaPortal",
      logo: {
        "@type": "ImageObject",
        url: "https://biomasaportal.pl/wp-content/uploads/2024/01/biomasaportal.png",
      },
    },
    mainEntityOfPage: `https://biomasaportal.pl${article.path}`,
    articleSection: category?.name ?? article.categoryName,
  });
}

function EditorialArticleContent({
  article,
  relatedItems,
}: {
  article: EditorialArticle;
  relatedItems: Awaited<ReturnType<typeof getCombinedBlogIndex>>;
}) {
  const category = getEditorialCategoryForArticle(article);
  const faqEntries = getEditorialFaqEntries(article.faqSchema);

  return (
    <div className="mirror-html editorial-article-content">
      <div
        data-elementor-type="wp-post"
        data-elementor-post-type="post"
        className="elementor elementor-location-single editorial-single-post"
      >
        <div className="elementor-element e-flex e-con-boxed e-con e-parent editorial-post-hero">
          <div className="e-con-inner">
            <div className="elementor-element elementor-widget elementor-widget-theme-post-title">
              <div className="elementor-widget-container">
                <h1 className="elementor-heading-title">{article.title}</h1>
              </div>
            </div>
            <div className="editorial-post-meta">
              <span>{category?.name ?? article.categoryName}</span>
              <span>
                {new Intl.DateTimeFormat("pl-PL", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(new Date(article.publishedAt ?? article.scheduledFor ?? Date.now()))}
              </span>
            </div>
          </div>
        </div>

        <div className="elementor-element e-flex e-con-boxed e-con e-parent editorial-post-layout">
          <div className="e-con-inner">
            <aside
              className="elementor-element elementor-widget elementor-widget-table-of-contents"
              data-settings='{"headings_by_tags":["h2"]}'
            >
              <div className="elementor-toc__header">
                <h3 className="elementor-toc__header-title">Spis tresci</h3>
              </div>
              <div className="elementor-toc__body" />
              {relatedItems.length > 0 ? (
                <div className="editorial-sidebar-posts">
                  <h3>Pozostale wpisy</h3>
                  <div className="elementor-posts-container elementor-posts elementor-posts--skin-cards elementor-grid">
                    {relatedItems.map((item) => (
                      <article
                        key={item.id}
                        className="elementor-post elementor-grid-item post type-post status-publish format-standard has-post-thumbnail hentry category-oze"
                      >
                        <div className="elementor-post__card">
                          {item.image ? (
                            <Link
                              className="elementor-post__thumbnail__link"
                              href={item.path}
                              tabIndex={-1}
                            >
                              <div className="elementor-post__thumbnail">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={item.image} alt={item.title} loading="lazy" />
                              </div>
                            </Link>
                          ) : null}
                          <div className="elementor-post__text">
                            <h3 className="elementor-post__title">
                              <Link href={item.path}>{item.title}</Link>
                            </h3>
                            <div className="elementor-post__excerpt">
                              <p>{item.excerpt}</p>
                            </div>
                            <div className="elementor-post__read-more-wrapper">
                              <Link className="elementor-post__read-more" href={item.path}>
                                Czytaj wiecej »
                              </Link>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}
            </aside>

            <div className="editorial-post-main">
              <div className="elementor-element elementor-widget elementor-widget-text-editor">
                <div
                  className="elementor-widget-container"
                  dangerouslySetInnerHTML={{ __html: article.htmlContent }}
                />
              </div>

              {faqEntries.length > 0 ? (
                <section className="elementor-element elementor-widget faq-section">
                  <div className="elementor-widget-container">
                    <h2>Najczesciej zadawane pytania</h2>
                    <div className="faq-list">
                      {faqEntries.map((entry) => (
                        <article key={entry.question} className="faq-item">
                          <div className="faq-question">{entry.question}</div>
                          <div
                            className="faq-answer"
                            dangerouslySetInnerHTML={{
                              __html: renderFaqAnswerHtml(entry.answerHtml),
                            }}
                          />
                        </article>
                      ))}
                    </div>
                  </div>
                </section>
              ) : null}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function EditorialArticlePage({ path }: { path: string }) {
  const [article, templateRoute, relatedIndex] = await Promise.all([
    getEditorialArticleByPath(path),
    getRouteByPath(TEMPLATE_ROUTE_PATH),
    getCombinedBlogIndex(),
  ]);

  if (!article || article.publicationStatus !== "published" || !templateRoute) {
    notFound();
  }

  const slotId = "editorial-article-slot";
  const html = transformExportedHtml(
    injectHtmlSlots(templateRoute.html, [
      { selector: '[data-elementor-type="wp-post"]', slotId },
    ]),
  );
  const [before, after] = splitHtmlBySlot(html, slotId);
  const relatedItems = relatedIndex
    .filter((item) => item.path !== article.path)
    .slice(0, 3);

  return (
    <>
      <WordPressBodyClass className={`${templateRoute.bodyClass} editorial-article-page`} />
      <WordPressAssets stylesheets={templateRoute.stylesheets} />
      <WordPressSeoScripts
        schemaJsonLd={[
          buildArticleSchema(article),
          ...(article.faqSchema ? [article.faqSchema] : []),
        ]}
      />
      <WordPressInteractiveEnhancer
        path={path}
        featuredImage={article.heroImage}
        isSinglePost
      />
      <div
        className="wp-mirror-page wp-mirror-page--single-post"
        style={
          article.heroImage
            ? ({
                ["--wp-featured-image" as string]: `url("${article.heroImage}")`,
              } as CSSProperties)
            : undefined
        }
      >
        <div className="mirror-html" dangerouslySetInnerHTML={{ __html: before }} />
        <EditorialArticleContent article={article} relatedItems={relatedItems} />
        <div className="mirror-html" dangerouslySetInnerHTML={{ __html: after }} />
      </div>
    </>
  );
}
