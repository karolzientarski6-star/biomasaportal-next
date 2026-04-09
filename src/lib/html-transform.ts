import { load } from "cheerio";

const ABSOLUTE_SITE_URL = "https://biomasaportal.pl";

export function transformExportedHtml(html: string) {
  return html
    .replace(/<\/?(?:html|head|body)[^>]*>/gi, "")
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi, "")
    .replaceAll('href="https://biomasaportal.pl"', 'href="/"')
    .replace(
      /href="(?:https:\/\/biomasaportal\.pl)?\/wp-login\.php[^"]*"/gi,
      'href="/zaloguj-sie/"',
    )
    .replaceAll(ABSOLUTE_SITE_URL, "")
    .replaceAll('href=""', 'href="/"')
    .replaceAll('src="//', 'src="https://')
    .replaceAll("href=\"//", 'href="https://');
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
