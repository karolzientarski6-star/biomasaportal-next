import { load } from "cheerio";

const ABSOLUTE_SITE_URL = "https://biomasaportal.pl";
const PERSISTENT_HIDDEN_BUTTON_LABELS = new Set([
  "Dodaj ogłoszenie",
  "Załóż konto",
]);

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

  if (
    normalized.startsWith("http://") ||
    normalized.startsWith("https://") ||
    normalized.startsWith("data:")
  ) {
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

export function transformExportedHtml(html: string) {
  const $ = load(html);

  $("script").remove();
  $("link[rel='stylesheet']").remove();

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
      .filter(
        (token) => shouldKeepInvisibleClass || token !== "elementor-invisible",
      )
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

    $(element).attr("srcset", rewriteSrcSet(srcSet));
  });

  $("[poster]").each((_, element) => {
    const poster = $(element).attr("poster");

    if (!poster) {
      return;
    }

    $(element).attr("poster", toAbsoluteSiteUrl(poster));
  });

  return $("body").html() ?? $.root().html() ?? html;
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
