import { load } from "cheerio";
import { EDITORIAL_CATEGORIES } from "@/lib/editorial-categories";

const ABSOLUTE_SITE_URL = "https://biomasaportal.pl";
const PERSISTENT_HIDDEN_BUTTON_LABELS = new Set([
  "Zaloz konto",
  "Załóż konto",
]);

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeUrl(url: string) {
  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  return url;
}

function toRelativeSiteUrl(url: string) {
  const normalized = normalizeUrl(url);

  if (!normalized.startsWith(ABSOLUTE_SITE_URL)) {
    return normalized;
  }

  const parsed = new URL(normalized);
  const path = `${parsed.pathname}${parsed.search}${parsed.hash}`;
  return path || "/";
}

function toAbsoluteSiteUrl(url: string) {
  const normalized = normalizeUrl(url);

  if (normalized.startsWith("data:")) {
    return normalized;
  }

  // Convert absolute biomasaportal.pl /wp-content/ URLs to relative paths
  // so Vercel serves them from /public/wp-content/ (avoids 404s after DNS migration)
  if (normalized.startsWith(`${ABSOLUTE_SITE_URL}/wp-content/`)) {
    return normalized.slice(ABSOLUTE_SITE_URL.length);
  }

  if (
    normalized.startsWith("http://") ||
    normalized.startsWith("https://")
  ) {
    return normalized;
  }

  // Keep /wp-content/ as relative — served by Vercel from /public/wp-content/
  if (normalized.startsWith("/wp-content/")) {
    return normalized;
  }

  if (normalized.startsWith("/")) {
    return `${ABSOLUTE_SITE_URL}${normalized}`;
  }

  return normalized;
}

function rewriteSrcSet(value: string) {
  return value
    .split(",")
    .map((candidate) => candidate.trim())
    .filter(Boolean)
    .map((candidate) => {
      const [url, descriptor] = candidate.split(/\s+/, 2);
      const absoluteUrl = toAbsoluteSiteUrl(url);
      return descriptor ? `${absoluteUrl} ${descriptor}` : absoluteUrl;
    })
    .join(", ");
}

function buildMegaMenuHtml(parentLinkClass: string, childLinkClass: string, tabIndex?: string) {
  const tabIndexAttribute = tabIndex ? ` tabindex="${escapeHtml(tabIndex)}"` : "";
  const tiles = EDITORIAL_CATEGORIES.map(
    (category) => `
      <li class="menu-item biomasa-mega-menu__item">
        <a href="/biomasa-w-polsce/${category.slug}/" class="${escapeHtml(childLinkClass)} biomasa-mega-menu__link"${tabIndexAttribute}>
          <span class="biomasa-mega-menu__eyebrow">${escapeHtml(category.accentLabel)}</span>
          <span class="biomasa-mega-menu__label">${escapeHtml(category.name)}</span>
          <span class="biomasa-mega-menu__copy">${escapeHtml(category.shortDescription)}</span>
        </a>
      </li>`,
  ).join("");

  return `
    <li class="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children biomasa-mega-menu">
      <a href="/biomasa-w-polsce/" class="${escapeHtml(parentLinkClass)}">Biomasa w Polsce</a>
      <ul class="sub-menu elementor-nav-menu--dropdown biomasa-mega-menu__panel">
        ${tiles}
      </ul>
    </li>`;
}

function replaceMachinesMenu($: ReturnType<typeof load>) {
  $("li.menu-item")
    .has("a[href*='/product-category/maszyny-lesne/']")
    .each((_, element) => {
      const item = $(element);
      const link = item.children("a").first();

      if (!link.length) {
        return;
      }

      const parentLinkClass = link.attr("class") || "elementor-item";
      const firstChildLink =
        item.find("ul.sub-menu a").first().attr("class") || "elementor-sub-item";
      const tabIndex = link.attr("tabindex") || undefined;

      item.replaceWith(buildMegaMenuHtml(parentLinkClass, firstChildLink, tabIndex));
    });
}

export function transformExportedHtml(html: string) {
  const $ = load(html);

  $("script").remove();
  $("link[rel='stylesheet']").remove();
  $("#cookie-notice, .cookie-notice-hidden, .cn-revoke-cookie, .cn-revoke-inline").remove();

  replaceMachinesMenu($);

  $("[class]").each((_, element) => {
    const className = $(element).attr("class");

    if (!className) {
      return;
    }

    const classTokens = className.split(/\s+/).filter(Boolean);
    const textContent = $(element).text().replace(/\s+/g, " ").trim();
    const shouldKeepInvisibleClass =
      classTokens.includes("elementor-widget-button") &&
      PERSISTENT_HIDDEN_BUTTON_LABELS.has(textContent);

    const nextClassName = classTokens
      .filter((token) => shouldKeepInvisibleClass || token !== "elementor-invisible")
      .join(" ");

    if (nextClassName) {
      $(element).attr("class", nextClassName);
    } else {
      $(element).removeAttr("class");
    }
  });

  $("[style]").each((_, element) => {
    const style = $(element).attr("style");

    if (!style) {
      return;
    }

    const className = $(element).attr("class") ?? "";
    const textContent = $(element).text().replace(/\s+/g, " ").trim();
    const shouldKeepHiddenStyle =
      className.includes("elementor-widget-button") &&
      PERSISTENT_HIDDEN_BUTTON_LABELS.has(textContent);

    if (shouldKeepHiddenStyle) {
      return;
    }

    const nextStyle = style
      .replace(/visibility\s*:\s*hidden;?/gi, "")
      .replace(/opacity\s*:\s*0;?/gi, "")
      .trim();

    if (nextStyle) {
      $(element).attr("style", nextStyle);
    } else {
      $(element).removeAttr("style");
    }
  });

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");

    if (!href) {
      return;
    }

    const normalized = normalizeUrl(href);

    if (/\/wp-login\.php/i.test(normalized)) {
      $(element).attr("href", "/zaloguj-sie/");
      return;
    }

    if (normalized.startsWith(ABSOLUTE_SITE_URL)) {
      const parsed = new URL(normalized);

      if (parsed.pathname.startsWith("/wp-content/")) {
        $(element).attr("href", normalized);
        return;
      }

      $(element).attr("href", toRelativeSiteUrl(normalized));
      return;
    }

    if (normalized.startsWith("/wp-content/")) {
      $(element).attr("href", toAbsoluteSiteUrl(normalized));
      return;
    }

    if (normalized === "") {
      $(element).attr("href", "/");
      return;
    }

    $(element).attr("href", normalized);
  });

  $("form[action]").each((_, element) => {
    const action = $(element).attr("action");

    if (!action) {
      return;
    }

    const normalized = normalizeUrl(action);
    $(element).attr(
      "action",
      normalized.startsWith(ABSOLUTE_SITE_URL)
        ? toRelativeSiteUrl(normalized)
        : normalized,
    );
  });

  $("[src]").each((_, element) => {
    const src = $(element).attr("src");

    if (!src) {
      return;
    }

    $(element).attr("src", toAbsoluteSiteUrl(src));
  });

  $("[srcset]").each((_, element) => {
    const srcSet = $(element).attr("srcset");

    if (!srcSet) {
      return;
    }

    // If the srcset refers to /wp-content/ resources (resized variants), strip it
    // so the browser uses the src attribute instead (which we serve from /public/).
    // This prevents 404s on mobile where the browser prefers smaller srcset sizes.
    if (srcSet.includes("/wp-content/")) {
      $(element).removeAttr("srcset");
      $(element).removeAttr("sizes");
    } else {
      $(element).attr("srcset", rewriteSrcSet(srcSet));
    }
  });

  $("[poster]").each((_, element) => {
    const poster = $(element).attr("poster");

    if (!poster) {
      return;
    }

    $(element).attr("poster", toAbsoluteSiteUrl(poster));
  });

  $("img").each((index, element) => {
    const image = $(element);
    image.attr("decoding", "async");

    if (!image.attr("loading")) {
      image.attr("loading", index === 0 ? "eager" : "lazy");
    }

    if (!image.attr("fetchpriority")) {
      image.attr("fetchpriority", index === 0 ? "high" : "low");
    }
  });

  const output = $("body").html() ?? $.root().html() ?? html;
  return output.replaceAll("kontakt@maxdigital.pl", "kontakt@biomasaportal.pl");
}

/**
 * Normalise a WP image URL so it resolves from Vercel's /public/.
 * Converts https://biomasaportal.pl/wp-content/... → /wp-content/...
 * Leaves relative paths and non-WP URLs unchanged.
 */
export function normalizeWpImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith(`${ABSOLUTE_SITE_URL}/wp-content/`)) {
    return url.slice(ABSOLUTE_SITE_URL.length);
  }
  return url;
}

type HtmlSlot = {
  selector: string;
  slotId: string;
};

export function injectHtmlSlots(html: string, slots: HtmlSlot[]) {
  if (slots.length === 0) {
    return html;
  }

  const $ = load(html);

  for (const slot of slots) {
    const target = $(slot.selector).first();

    if (!target.length) {
      continue;
    }

    target.replaceWith(`<div data-next-slot="${slot.slotId}"></div>`);
  }

  return $("body").html() ?? $.root().html() ?? html;
}
