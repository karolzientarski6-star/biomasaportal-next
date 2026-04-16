import type { CSSProperties } from "react";
import { load } from "cheerio";
import { notFound } from "next/navigation";
import {
  getEditorialArticleByPath,
  getEditorialFaqEntries,
  renderFaqAnswerHtml,
  type EditorialArticle,
} from "@/lib/editorial";
import { transformExportedHtml } from "@/lib/html-transform";
import { getRouteByPath } from "@/lib/wordpress-export";
import { WordPressAssets } from "@/components/wordpress-assets";
import { WordPressBodyClass } from "@/components/wordpress-body-class";
import { WordPressInteractiveEnhancer } from "@/components/wordpress-interactive-enhancer";
import { WordPressSeoScripts } from "@/components/wordpress-seo-scripts";

// A published WP single-post route used as the HTML shell for editorial articles.
// Its stylesheets and Elementor structure give editorial posts the same visual
// appearance as regular WordPress posts.
const WP_SINGLE_POST_TEMPLATE_PATH = "/cena-zrebki-drzewnej-2026/";

function buildArticleSchema(article: EditorialArticle) {
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

function buildFaqHtml(article: EditorialArticle) {
  const entries = getEditorialFaqEntries(article.faqSchema);
  if (!entries.length) return "";

  const items = entries
    .map(
      (entry) =>
        `<div class="faq-item"><div class="faq-question">${entry.question}</div><div class="faq-answer">${renderFaqAnswerHtml(entry.answerHtml)}</div></div>`,
    )
    .join("");

  return `<section class="faq-section elementor-element elementor-widget"><div class="elementor-widget-container"><h2>Najczęściej zadawane pytania</h2><div class="faq-list">${items}</div></div></section>`;
}

/**
 * Takes a WP single-post HTML export and injects editorial article content into
 * the appropriate Elementor slots, so the editorial post inherits the full WP
 * visual template (CSS, sidebar TOC, hero section, etc.).
 */
function injectEditorialIntoWpTemplate(
  templateHtml: string,
  article: EditorialArticle,
): string {
  const $ = load(templateHtml);

  // 1. Replace the title in the first heading widget.
  const titleEl = $(".elementor-widget-heading .elementor-heading-title").first();
  if (titleEl.length) {
    titleEl.text(article.title);
  }

  // 2. Replace the main text-editor content with the editorial HTML + FAQ.
  //    The WP template has two text-editor widgets in the content section;
  //    we fill the first with article content and remove the second.
  const faqHtml = buildFaqHtml(article);
  const contentHtml = article.htmlContent + faqHtml;

  const textEditors = $(".elementor-widget-text-editor").filter((_, el) => {
    // Exclude footer copyright text editor
    const text = $(el).text().trim();
    return !text.includes("Max Digital") && text.length > 20;
  });

  textEditors.first().find(".elementor-widget-container").html(contentHtml);
  textEditors.slice(1).remove();

  return $("body").html() ?? templateHtml;
}

export async function EditorialArticlePage({ path }: { path: string }) {
  const [article, templateRoute] = await Promise.all([
    getEditorialArticleByPath(path),
    getRouteByPath(WP_SINGLE_POST_TEMPLATE_PATH),
  ]);

  if (!article || article.publicationStatus !== "published") {
    notFound();
  }

  const rawTemplateHtml = templateRoute?.html ?? "";
  const injectedHtml = templateRoute
    ? injectEditorialIntoWpTemplate(rawTemplateHtml, article)
    : "";
  const finalHtml = transformExportedHtml(injectedHtml);

  const bodyClass = templateRoute?.bodyClass ?? "single single-post";

  return (
    <>
      <WordPressBodyClass className={bodyClass} />
      {templateRoute && <WordPressAssets stylesheets={templateRoute.stylesheets} />}
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
        <div
          className="mirror-html"
          dangerouslySetInnerHTML={{ __html: finalHtml }}
        />
      </div>
    </>
  );
}
