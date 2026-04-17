import type { CSSProperties } from "react";
import { load, type CheerioAPI, type Cheerio } from "cheerio";
import { notFound } from "next/navigation";
import {
  extractFaqSchemaJsonLd,
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

const WP_SINGLE_POST_TEMPLATE_PATH = "/cena-zrebki-drzewnej-2026/";

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

function buildFaqHtml(article: EditorialArticle) {
  const entries = getEditorialFaqEntries(article.faqSchema);
  if (!entries.length) {
    return "";
  }

  const items = entries
    .map(
      (entry) =>
        `<div class="faq-item"><div class="faq-question">${entry.question}</div><div class="faq-answer">${renderFaqAnswerHtml(entry.answerHtml)}</div></div>`,
    )
    .join("");

  return `<section class="faq-section elementor-element elementor-widget"><div class="elementor-widget-container"><h2>Najczesciej zadawane pytania</h2><div class="faq-list">${items}</div></div></section>`;
}

function replaceWidgetInnerHtml(
  widget: Cheerio<any>,
  html: string,
) {
  const container = widget.find(".elementor-widget-container").first();

  if (container.length) {
    container.html(html);
    return;
  }

  widget.html(html);
}

function replaceTemplateHeadingNodes($: CheerioAPI, articleRoot: Cheerio<any>, title: string) {
  articleRoot
    .find(".elementor-widget-heading .elementor-heading-title")
    .slice(0, 2)
    .each((_, element) => {
      $(element).text(title);
    });
}

function replaceTemplateBreadcrumb(articleRoot: Cheerio<any>, title: string) {
  const breadcrumbItems = articleRoot.find(
    ".elementor-widget-post-info .elementor-post-info__item--type-custom",
  );

  if (breadcrumbItems.length >= 2) {
    breadcrumbItems.last().text(title);
  }
}

function injectEditorialIntoWpTemplate(
  templateHtml: string,
  article: EditorialArticle,
): string {
  const $ = load(templateHtml);
  const articleRoot = $("[data-elementor-post-type='post']").first();

  replaceTemplateBreadcrumb(articleRoot, article.title);
  replaceTemplateHeadingNodes($, articleRoot, article.title);

  const faqHtml = buildFaqHtml(article);
  const introHtml = article.metaDescription
    ? `<p>${article.metaDescription}</p>`
    : "";
  const contentHtml = `${article.htmlContent}${faqHtml}`;

  const textEditors = articleRoot.find(".elementor-widget-text-editor").filter((_, el) => {
    const text = $(el).text().trim();
    return !text.includes("Max Digital") && text.length > 20;
  });

  if (textEditors.length >= 2) {
    replaceWidgetInnerHtml(textEditors.first(), introHtml || "<p>&nbsp;</p>");
    replaceWidgetInnerHtml(textEditors.eq(1), contentHtml);
    textEditors.slice(2).remove();
  } else {
    replaceWidgetInnerHtml(textEditors.first(), `${introHtml}${contentHtml}`);
    textEditors.slice(1).remove();
  }

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
      {templateRoute ? <WordPressAssets stylesheets={templateRoute.stylesheets} /> : null}
      <WordPressSeoScripts
        schemaJsonLd={[
          buildArticleSchema(article),
          ...extractFaqSchemaJsonLd(article.faqSchema ?? ""),
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
        <div className="mirror-html" dangerouslySetInnerHTML={{ __html: finalHtml }} />
      </div>
    </>
  );
}
