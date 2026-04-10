import { load } from "cheerio";

export type ElementorWidgetSignature = {
  attributes: Record<string, string>;
  widgetContainerAttributes: Record<string, string>;
  postsContainerAttributes: Record<string, string>;
  articleAttributes: Record<string, string>;
  cardAttributes: Record<string, string>;
  thumbnailLinkAttributes: Record<string, string>;
  thumbnailAttributes: Record<string, string>;
  badgeAttributes: Record<string, string>;
  textAttributes: Record<string, string>;
  titleAttributes: Record<string, string>;
  excerptAttributes: Record<string, string>;
  readMoreAttributes: Record<string, string>;
  metaAttributes: Record<string, string>;
  dateAttributes: Record<string, string>;
};

function readAttributes(element?: unknown) {
  if (
    !element ||
    typeof element !== "object" ||
    !("attribs" in element) ||
    !element.attribs
  ) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(element.attribs as Record<string, string>).filter(
      ([, value]) => typeof value === "string",
    ),
  );
}

function firstAttributes(searchRoot: { find: (selector: string) => { first: () => { get: (index: number) => unknown } } }, selector: string) {
  const element = searchRoot.find(selector).first().get(0);
  return readAttributes(element);
}

export function extractElementorPostsWidgetSignatures(html: string) {
  const $ = load(html);

  return $(".elementor-widget-posts")
    .map((_, element) => {
      const widget = $(element);

      return {
        attributes: readAttributes(element),
        widgetContainerAttributes: firstAttributes(widget, ".elementor-widget-container"),
        postsContainerAttributes: firstAttributes(widget, ".elementor-posts-container"),
        articleAttributes: firstAttributes(widget, ".elementor-post"),
        cardAttributes: firstAttributes(widget, ".elementor-post__card"),
        thumbnailLinkAttributes: firstAttributes(widget, ".elementor-post__thumbnail__link"),
        thumbnailAttributes: firstAttributes(widget, ".elementor-post__thumbnail"),
        badgeAttributes: firstAttributes(widget, ".elementor-post__badge"),
        textAttributes: firstAttributes(widget, ".elementor-post__text"),
        titleAttributes: firstAttributes(widget, ".elementor-post__title"),
        excerptAttributes: firstAttributes(widget, ".elementor-post__excerpt"),
        readMoreAttributes: firstAttributes(widget, ".elementor-post__read-more"),
        metaAttributes: firstAttributes(widget, ".elementor-post__meta-data"),
        dateAttributes: firstAttributes(widget, ".elementor-post-date"),
      } satisfies ElementorWidgetSignature;
    })
    .get();
}
