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
import { getCombinedBlogIndex } from "@/lib/blog-index";
import { transformExportedHtml } from "@/lib/html-transform";
import {
  getOptimizedWpImageByHints,
  getOptimizedWpImageUrl,
} from "@/lib/wp-image-variants";
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

function sanitizeEditorialContent(html: string) {
  const $ = load(html);

  $(".faq-container, .faq-section").remove();
  $(".faq-item").each((_, element) => {
    const question = $(element).find(".faq-question").first();
    const answer = $(element).find(".faq-answer").first();

    if (question.length && answer.length) {
      $(element).remove();
    }
  });

  $("[onclick*='toggleFAQ']").removeAttr("onclick");

  $("script").each((_, element) => {
    const scriptContent = $(element).html() ?? "";

    if (/toggleFAQ/i.test(scriptContent)) {
      $(element).remove();
    }
  });

  return $.root().html() ?? html;
}

function normalizePath(value: string) {
  return value.replace(/^https?:\/\/[^/]+/i, "").replace(/\/+$/, "") || "/";
}

function cleanRelatedExcerpt(value: string) {
  return value
    .replace(/^\s*spis\s+tre(?:ś|s)ci\b[:\s-]*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function enhanceRelatedPostsSidebar(
  $: CheerioAPI,
  articleRoot: Cheerio<any>,
  relatedPosts: Array<{
    path: string;
    title: string;
    excerpt: string;
    image: string | null;
  }>,
) {
  const relatedPostsMap = new Map(
    relatedPosts.map((item) => [normalizePath(item.path), item]),
  );
  const postsWidget = articleRoot.find(".elementor-widget-posts").last();

  if (!postsWidget.length) {
    return;
  }

  postsWidget.addClass("editorial-sidebar-posts");
  const cards = postsWidget
    .find(".elementor-post")
    .map((_, element) => {
      const article = $(element);
      const titleLink = article.find(".elementor-post__title a").first();
      const href = titleLink.attr("href") ?? "";
      const related = relatedPostsMap.get(normalizePath(href));
      const title = titleLink.text().trim() || related?.title || "";
      const excerpt = cleanRelatedExcerpt(
        related?.excerpt || article.find(".elementor-post__excerpt p").first().text() || "",
      );
      const optimizedImage =
        getOptimizedWpImageUrl(related?.image, 480) ||
        getOptimizedWpImageByHints([related?.title || title, related?.path || href], 480);
      const safeHref = escapeHtml(related?.path || href);
      const safeTitle = escapeHtml(title);
      const safeExcerpt = escapeHtml(excerpt || title);

      const thumbnailHtml = optimizedImage
        ? `<a class="elementor-post__thumbnail__link" href="${safeHref}" tabindex="-1" style="position:relative;display:block;overflow:hidden;margin:0;padding:0;aspect-ratio:1 / 0.78;min-height:200px;background:linear-gradient(180deg,#f4f4f4 0%,#d8d8d8 100%);"><div class="elementor-post__thumbnail" style="position:relative;display:block;overflow:hidden;width:100%;height:100%;margin:0;padding:0;"><img decoding="async" src="${optimizedImage}" alt="${safeTitle}" loading="lazy" fetchpriority="low" style="position:absolute;inset:0;display:block;width:100%;height:100%;max-width:none;object-fit:cover;object-position:center;"></div></a>`
        : "";

      return `<article class="elementor-post elementor-grid-item" role="listitem" style="width:100%;margin:0;"><div class="elementor-post__card" style="display:grid;grid-template-rows:auto 1fr;overflow:hidden;border-radius:18px;background:#fff;box-shadow:0 18px 34px rgba(12,36,28,0.16);height:auto;">${thumbnailHtml}<div class="elementor-post__text" style="display:grid;align-content:start;gap:10px;padding:22px 24px 18px;height:auto;"><h3 class="elementor-post__title" style="margin:0;"><a href="${safeHref}" style="color:var(--brand);font-size:1.02rem;line-height:1.15;text-decoration:none;">${safeTitle}</a></h3><div class="elementor-post__excerpt" style="margin:0;"><p style="margin:0;color:#737373;font-size:13px;line-height:1.85;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden;">${safeExcerpt}</p></div><div class="elementor-post__read-more-wrapper" style="margin-top:2px;"><a class="elementor-post__read-more" href="${safeHref}" aria-label="Read more about ${safeTitle}" tabindex="-1" style="color:#ff2f73;font-size:12px;font-weight:600;text-transform:uppercase;text-decoration:none;">Czytaj więcej »</a></div></div></div></article>`;
    })
    .get()
    .join("");

  const container = postsWidget.find(".elementor-posts-container").first();
  if (container.length && cards) {
    container.html(cards);
  }
}

function injectEditorialIntoWpTemplate(
  templateHtml: string,
  article: EditorialArticle,
  relatedPosts: Array<{
    path: string;
    title: string;
    excerpt: string;
    image: string | null;
  }>,
): string {
  const $ = load(templateHtml);
  const articleRoot = $("[data-elementor-post-type='post']").first();

  replaceTemplateBreadcrumb(articleRoot, article.title);
  replaceTemplateHeadingNodes($, articleRoot, article.title);

  const faqHtml = buildFaqHtml(article);
  const introHtml = article.metaDescription
    ? `<p>${article.metaDescription}</p>`
    : "";
  const sanitizedContentHtml = sanitizeEditorialContent(article.htmlContent);
  const contentHtml = `${sanitizedContentHtml}${faqHtml}`;

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

  enhanceRelatedPostsSidebar($, articleRoot, relatedPosts);

  return $("body").html() ?? templateHtml;
}

function rewriteFinalRelatedPostsHtml(
  html: string,
  relatedPosts: Array<{
    path: string;
    title: string;
    excerpt: string;
    image: string | null;
  }>,
) {
  const $ = load(html);
  const relatedPostsMap = new Map(
    relatedPosts.map((item) => [normalizePath(item.path), item]),
  );
  const container = $(".editorial-sidebar-posts .elementor-posts-container").first();

  if (!container.length) {
    return html;
  }

  const cards = container
    .find(".elementor-post")
    .map((_, element) => {
      const article = $(element);
      const titleLink = article.find(".elementor-post__title a").first();
      const href = titleLink.attr("href") ?? "";
      const related = relatedPostsMap.get(normalizePath(href));
      const title = titleLink.text().trim() || related?.title || "";
      const excerpt = cleanRelatedExcerpt(
        related?.excerpt || article.find(".elementor-post__excerpt p").first().text() || "",
      );
      const optimizedImage =
        getOptimizedWpImageUrl(related?.image, 480) ||
        getOptimizedWpImageByHints([related?.title || title, related?.path || href], 480);
      const safeHref = escapeHtml(related?.path || href);
      const safeTitle = escapeHtml(title);
      const safeExcerpt = escapeHtml(excerpt || title);
      const thumbnailHtml = optimizedImage
        ? `<a class="elementor-post__thumbnail__link" href="${safeHref}" tabindex="-1" style="position:relative;display:block;overflow:hidden;margin:0;padding:0;aspect-ratio:1 / 0.78;min-height:200px;background:linear-gradient(180deg,#f4f4f4 0%,#d8d8d8 100%);"><div class="elementor-post__thumbnail" style="position:relative;display:block;overflow:hidden;width:100%;height:100%;margin:0;padding:0;"><img decoding="async" src="${optimizedImage}" alt="${safeTitle}" loading="lazy" fetchpriority="low" style="position:absolute;inset:0;display:block;width:100%;height:100%;max-width:none;object-fit:cover;object-position:center;"></div></a>`
        : "";

      return `<article class="elementor-post elementor-grid-item" role="listitem" style="width:100%;margin:0;"><div class="elementor-post__card" style="display:grid;grid-template-rows:auto 1fr;overflow:hidden;border-radius:18px;background:#fff;box-shadow:0 18px 34px rgba(12,36,28,0.16);height:auto;">${thumbnailHtml}<div class="elementor-post__text" style="display:grid;align-content:start;gap:10px;padding:22px 24px 18px;height:auto;"><h3 class="elementor-post__title" style="margin:0;"><a href="${safeHref}" style="color:var(--brand);font-size:1.02rem;line-height:1.15;text-decoration:none;">${safeTitle}</a></h3><div class="elementor-post__excerpt" style="margin:0;"><p style="margin:0;color:#737373;font-size:13px;line-height:1.85;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden;">${safeExcerpt}</p></div><div class="elementor-post__read-more-wrapper" style="margin-top:2px;"><a class="elementor-post__read-more" href="${safeHref}" aria-label="Read more about ${safeTitle}" tabindex="-1" style="color:#ff2f73;font-size:12px;font-weight:600;text-transform:uppercase;text-decoration:none;">Czytaj więcej »</a></div></div></div></article>`;
    })
    .get()
    .join("");

  if (cards) {
    container.html(cards);
  }

  return $("body").html() ?? html;
}

export async function EditorialArticlePage({ path }: { path: string }) {
  const [article, templateRoute, blogIndex] = await Promise.all([
    getEditorialArticleByPath(path),
    getRouteByPath(WP_SINGLE_POST_TEMPLATE_PATH),
    getCombinedBlogIndex(),
  ]);

  if (!article || article.publicationStatus !== "published") {
    notFound();
  }

  const rawTemplateHtml = templateRoute?.html ?? "";
  const relatedPosts = blogIndex
    .filter((item) => item.path !== path)
    .slice(0, 8)
    .map((item) => ({
      path: item.path,
      title: item.title,
      excerpt: item.excerpt,
      image: item.image,
    }));
  const relatedPostsPayload = relatedPosts.map((item) => ({
    path: item.path,
    title: item.title,
    excerpt: cleanRelatedExcerpt(item.excerpt || item.title),
    image:
      getOptimizedWpImageUrl(item.image, 480) ||
      getOptimizedWpImageByHints([item.title, item.path], 480),
  }));
  const injectedHtml = templateRoute
    ? injectEditorialIntoWpTemplate(rawTemplateHtml, article, relatedPosts)
    : "";
  const transformedHtml = transformExportedHtml(injectedHtml);
  const finalHtml = rewriteFinalRelatedPostsHtml(transformedHtml, relatedPosts);
  const relatedPostsPayloadJson = JSON.stringify(relatedPostsPayload);

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
        className="wp-mirror-page wp-mirror-page--single-post editorial-single-post"
        style={
          article.heroImage
            ? ({
                ["--wp-featured-image" as string]: `url("${article.heroImage}")`,
              } as CSSProperties)
            : undefined
        }
      >
        <script
          type="application/json"
          id="editorial-related-posts-data"
          dangerouslySetInnerHTML={{ __html: relatedPostsPayloadJson }}
        />
        <div className="mirror-html" dangerouslySetInnerHTML={{ __html: finalHtml }} />
      </div>
    </>
  );
}
