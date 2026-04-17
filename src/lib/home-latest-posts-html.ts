import type { BlogIndexItem } from "@/lib/blog-index";
import type { ElementorWidgetSignature } from "@/lib/elementor-posts-widget";
import { getOptimizedWpImageUrl } from "@/lib/wp-image-variants";

const dayMonthFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "long",
});

const yearFormatter = new Intl.DateTimeFormat("pl-PL", {
  year: "numeric",
});

function formatWpDate(value: string) {
  const date = new Date(value);
  return `${dayMonthFormatter.format(date)}, ${yearFormatter.format(date)}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toAttributes(attributes?: Record<string, string>) {
  if (!attributes) {
    return "";
  }

  return Object.entries(attributes)
    .filter(([, value]) => typeof value === "string" && value.length > 0)
    .map(([key, value]) => ` ${key}="${escapeHtml(value)}"`)
    .join("");
}

function mergeClassName(attributes: Record<string, string> | undefined, className: string) {
  const nextAttributes = { ...(attributes ?? {}) };
  const existing = nextAttributes.class ?? "";
  nextAttributes.class = [className, existing].filter(Boolean).join(" ");
  return nextAttributes;
}

function renderPostsGrid(
  items: BlogIndexItem[],
  widgetSignature: ElementorWidgetSignature | null,
) {
  const widgetAttributes = mergeClassName(widgetSignature?.attributes, "blog-archive-grid-root");
  const widgetContainerAttributes =
    widgetSignature?.widgetContainerAttributes ?? {
      class: "elementor-widget-container",
    };
  const postsContainerAttributes =
    widgetSignature?.postsContainerAttributes ?? {
      class:
        "elementor-posts-container elementor-posts elementor-posts--skin-cards elementor-grid",
      role: "list",
    };
  const articleAttributes =
    widgetSignature?.articleAttributes ?? {
      class:
        "elementor-post elementor-grid-item post type-post status-publish format-standard has-post-thumbnail hentry",
      role: "listitem",
    };
  const cardAttributes =
    widgetSignature?.cardAttributes ?? { class: "elementor-post__card" };
  const thumbnailLinkAttributes =
    widgetSignature?.thumbnailLinkAttributes ?? {
      class: "elementor-post__thumbnail__link",
      tabindex: "-1",
    };
  const thumbnailAttributes =
    widgetSignature?.thumbnailAttributes ?? { class: "elementor-post__thumbnail" };
  const badgeAttributes =
    widgetSignature?.badgeAttributes ?? { class: "elementor-post__badge" };
  const textAttributes =
    widgetSignature?.textAttributes ?? { class: "elementor-post__text" };
  const titleAttributes =
    widgetSignature?.titleAttributes ?? { class: "elementor-post__title" };
  const excerptAttributes =
    widgetSignature?.excerptAttributes ?? { class: "elementor-post__excerpt" };
  const readMoreAttributes =
    widgetSignature?.readMoreAttributes ?? { class: "elementor-post__read-more" };
  const metaAttributes =
    widgetSignature?.metaAttributes ?? { class: "elementor-post__meta-data" };
  const dateAttributes =
    widgetSignature?.dateAttributes ?? { class: "elementor-post-date" };

  const cardsHtml = items
    .map((item) => {
      const imageUrl = getOptimizedWpImageUrl(item.image, 640);
      const thumbnailHtml = imageUrl
        ? `<a${toAttributes({
            ...thumbnailLinkAttributes,
            href: item.path,
            tabindex: "-1",
          })}><div${toAttributes(thumbnailAttributes)}><img src="${escapeHtml(
            imageUrl,
          )}" alt="${escapeHtml(item.title)}" loading="lazy" decoding="async"></div></a>`
        : "";

      return `<article${toAttributes(articleAttributes)}>
        <div${toAttributes(cardAttributes)}>
          ${thumbnailHtml}
          <div${toAttributes(badgeAttributes)}>${escapeHtml(item.categoryName)}</div>
          <div${toAttributes(textAttributes)}>
            <h3${toAttributes(titleAttributes)}>
              <a href="${escapeHtml(item.path)}">${escapeHtml(item.title)}</a>
            </h3>
            <div${toAttributes(excerptAttributes)}>
              <p>${escapeHtml(item.excerpt)}</p>
            </div>
            <a${toAttributes({
              ...readMoreAttributes,
              href: item.path,
              tabindex: "-1",
              "aria-label": `Czytaj więcej o ${item.title}`,
            })}>Czytaj więcej &gt;</a>
          </div>
          <div${toAttributes(metaAttributes)}>
            <span${toAttributes(dateAttributes)}>${escapeHtml(
              formatWpDate(item.lastModified),
            )}</span>
          </div>
        </div>
      </article>`;
    })
    .join("");

  return `<div${toAttributes(widgetAttributes)}>
    <div${toAttributes(widgetContainerAttributes)}>
      <div${toAttributes(postsContainerAttributes)}>
        ${cardsHtml}
      </div>
    </div>
  </div>`;
}

export function buildHomeLatestPostsSectionHtml(
  items: BlogIndexItem[],
  widgetSignature: ElementorWidgetSignature | null,
) {
  return `<div class="elementor-element elementor-element-64cd8fb e-flex e-con-boxed e-con e-parent" data-id="64cd8fb" data-element_type="container" id="przejdz-dalej" data-settings="{&quot;background_background&quot;:&quot;classic&quot;,&quot;shape_divider_top&quot;:&quot;waves&quot;}">
    <div class="e-con-inner">
      <div class="elementor-shape elementor-shape-top" aria-hidden="true" data-negative="false">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" preserveAspectRatio="none">
          <path class="elementor-shape-fill" d="M421.9,6.5c22.6-2.5,51.5,0.4,75.5,5.3c23.6,4.9,70.9,23.5,100.5,35.7c75.8,32.2,133.7,44.5,192.6,49.7 c23.6,2.1,48.7,3.5,103.4-2.5c54.7-6,106.2-25.6,106.2-25.6V0H0v30.3c0,0,72,32.6,158.4,30.5c39.2-0.7,92.8-6.7,134-22.4 c21.2-8.1,52.2-18.2,79.7-24.2C399.3,7.9,411.6,7.5,421.9,6.5z"></path>
        </svg>
      </div>
      <div class="elementor-element elementor-element-17b73e8 e-con-full e-flex e-con e-child" data-id="17b73e8" data-element_type="container">
        <div class="elementor-element elementor-element-fa5ec51 elementor-hidden-tablet elementor-hidden-mobile elementor-widget elementor-widget-spacer" data-id="fa5ec51" data-element_type="widget" data-widget_type="spacer.default">
          <div class="elementor-spacer"><div class="elementor-spacer-inner"></div></div>
        </div>
        <div class="elementor-element elementor-element-6154911 elementor-widget elementor-widget-menu-anchor" data-id="6154911" data-element_type="widget" data-widget_type="menu-anchor.default">
          <div class="elementor-menu-anchor" id="zespol"></div>
        </div>
        <div class="elementor-element elementor-element-642efff elementor-hidden-desktop elementor-widget elementor-widget-spacer" data-id="642efff" data-element_type="widget" data-widget_type="spacer.default">
          <div class="elementor-spacer"><div class="elementor-spacer-inner"></div></div>
        </div>
        <div class="elementor-element elementor-element-afee595 e-con-full e-flex e-con e-child" data-id="afee595" data-element_type="container">
          <div class="elementor-element elementor-element-4e9dc30 e-con-full e-flex e-con e-child" data-id="4e9dc30" data-element_type="container">
            <div class="elementor-element elementor-element-fd54d6e elementor-widget elementor-widget-image" data-id="fd54d6e" data-element_type="widget" data-widget_type="image.default">
              <img loading="lazy" decoding="async" width="200" height="200" src="/wp-content/uploads/2024/01/cropped-biomasaportal.png" class="attachment-full size-full wp-image-64" alt="">
            </div>
          </div>
          <div class="elementor-element elementor-element-2a2560b e-con-full e-flex e-con e-child" data-id="2a2560b" data-element_type="container">
            <div class="elementor-element elementor-element-d2288e0 elementor-widget elementor-widget-heading" data-id="d2288e0" data-element_type="widget" data-widget_type="heading.default">
              <h2 class="elementor-heading-title elementor-size-xl">Aktualności</h2>
            </div>
          </div>
        </div>
        <div class="elementor-element elementor-element-a94452a elementor-hidden-tablet elementor-hidden-mobile elementor-widget elementor-widget-spacer" data-id="a94452a" data-element_type="widget" data-widget_type="spacer.default">
          <div class="elementor-spacer"><div class="elementor-spacer-inner"></div></div>
        </div>
        <div class="elementor-element elementor-element-ac30b5a elementor-widget-divider--view-line elementor-widget elementor-widget-divider" data-id="ac30b5a" data-element_type="widget" data-widget_type="divider.default">
          <div class="elementor-divider"><span class="elementor-divider-separator"></span></div>
        </div>
        <div class="elementor-element elementor-element-6799c0c elementor-hidden-tablet elementor-hidden-mobile elementor-widget elementor-widget-spacer" data-id="6799c0c" data-element_type="widget" data-widget_type="spacer.default">
          <div class="elementor-spacer"><div class="elementor-spacer-inner"></div></div>
        </div>
        ${renderPostsGrid(items, widgetSignature)}
        <div class="elementor-element elementor-element-ca41823 elementor-align-right elementor-mobile-align-center elementor-widget elementor-widget-button" data-id="ca41823" data-element_type="widget" data-widget_type="button.default">
          <div class="elementor-widget-container">
            <div class="elementor-button-wrapper">
              <a class="elementor-button elementor-button-link elementor-size-xs" href="/wpisy/">
                <span class="elementor-button-content-wrapper">
                  <span class="elementor-button-text">Wszystkie wpisy</span>
                </span>
              </a>
            </div>
          </div>
        </div>
        <div class="elementor-element elementor-element-ac697fa elementor-hidden-tablet elementor-hidden-phone elementor-widget elementor-widget-spacer" data-id="ac697fa" data-element_type="widget" data-widget_type="spacer.default">
          <div class="elementor-spacer"><div class="elementor-spacer-inner"></div></div>
        </div>
      </div>
    </div>
  </div>`;
}
