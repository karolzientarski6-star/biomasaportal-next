import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { load } from "cheerio";
import { NativePreviewFooter } from "@/components/native-preview-footer";
import { NativePreviewHeader } from "@/components/native-preview-header";
import { WordPressAssets } from "@/components/wordpress-assets";
import { WordPressBodyClass } from "@/components/wordpress-body-class";
import { WordPressSeoScripts } from "@/components/wordpress-seo-scripts";
import { getCombinedBlogIndex } from "@/lib/blog-index";
import { extractElementorPostsWidgetSignatures } from "@/lib/elementor-posts-widget";
import { buildHomeLatestPostsSectionHtml } from "@/lib/home-latest-posts-html";
import { buildRouteMetadata, getRouteByPath } from "@/lib/wordpress-export";
import { transformExportedHtml } from "@/lib/html-transform";

export async function generateMetadata(): Promise<Metadata> {
  const route = await getRouteByPath("/");

  if (!route) {
    return {};
  }

  const metadata = buildRouteMetadata(route);

  return {
    ...metadata,
    title: `PODGLAD: ${typeof metadata.title === "string" ? metadata.title : "Biomasa Portal"}`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

type HeroCard = {
  href: string;
  title: string;
  image: string | null;
  price: string | null;
  location: string | null;
  dateLabel: string | null;
};

type PartnerLogo = {
  href: string;
  image: string | null;
  alt: string;
  width: number | null;
  height: number | null;
};

function normalizePreviewSectionHtml(sectionHtml: string) {
  return sectionHtml
    .replaceAll("https://biomasaportal.pl/wp-content/uploads/", "/wp-content/uploads/")
    .replaceAll("https://www.biomasaportal.pl/wp-content/uploads/", "/wp-content/uploads/")
    .replaceAll("https://biomasaportal.pl/", "/")
    .replaceAll("https://www.biomasaportal.pl/", "/");
}

function buildHeroSectionHtml(data: {
  heroTitle: string;
  heroSubtitle: string;
  heroDescriptionHtml: string;
  heroCards: HeroCard[];
}) {
  const cardsHtml = data.heroCards
    .map(
      (card) => `
        <article class="ogloszenie-card-home" style="display:block;min-width:0;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
          <a class="card-link" href="${card.href}" style="display:grid;grid-template-rows:auto 1fr;min-height:100%;color:inherit;text-decoration:none;">
            ${
              card.image
                ? `<div class="card-image" style="position:relative;padding-top:75%;background:#f5f5f5;overflow:hidden;">
                    <img src="${card.image}" alt="${card.title.replace(/"/g, "&quot;")}" loading="lazy" decoding="async" style="position:absolute;inset:0;display:block;width:100%;height:100%;max-width:none;object-fit:cover;object-position:center;" />
                  </div>`
                : '<div class="card-image placeholder" style="position:relative;padding-top:75%;background:#f5f5f5;overflow:hidden;"></div>'
            }
            <div class="card-content" style="display:grid;align-content:start;gap:10px;padding:15px;">
              <h3 class="card-title" style="margin:0;color:#333;font-size:16px;line-height:1.35;">${card.title}</h3>
              ${
                card.price
                  ? `<div class="card-price" style="margin:0;color:#2d5c3f;font-size:20px;font-weight:700;">${card.price}</div>`
                  : ""
              }
              <div class="card-meta" style="display:flex;flex-direction:column;gap:5px;color:#666;font-size:13px;">
                ${
                  card.location
                    ? `<span class="meta-location" style="display:flex;align-items:center;gap:5px;">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M7 1C4.24 1 2 3.24 2 6c0 3.5 5 7 5 7s5-3.5 5-7c0-2.76-2.24-5-5-5zm0 6.5c-.83 0-1.5-.67-1.5-1.5S6.17 4.5 7 4.5 8.5 5.17 8.5 6 7.83 7.5 7 7.5z" fill="currentColor"></path>
                        </svg>
                        ${card.location}
                      </span>`
                    : ""
                }
                ${card.dateLabel ? `<span class="meta-date">${card.dateLabel}</span>` : ""}
              </div>
            </div>
          </a>
        </article>`,
    )
    .join("");

  return `
    <div class="elementor-element elementor-element-ec8c212 e-flex e-con-boxed e-con e-parent" data-id="ec8c212" data-element_type="container">
      <div class="e-con-inner">
        <div class="elementor-element elementor-element-90d173b e-con-full e-flex e-con e-child" data-id="90d173b" data-element_type="container">
          <div class="elementor-element elementor-element-f4d460b e-con-full e-flex e-con e-child" data-id="f4d460b" data-element_type="container">
            <div class="elementor-element elementor-element-29a86f1 elementor-widget__width-auto elementor-widget-mobile__width-inherit elementor-widget elementor-widget-image" data-id="29a86f1" data-element_type="widget" data-widget_type="image.default">
              <img decoding="async" width="200" height="200" src="/wp-content/uploads/2024/01/biomasaportal.png" class="attachment-large size-large wp-image-63" alt="biomasa portal" />
            </div>
          </div>
          <div class="elementor-element elementor-element-b88a189 e-con-full e-flex e-con e-child" data-id="b88a189" data-element_type="container">
            <div class="elementor-element elementor-element-6ac8868 elementor-widget__width-initial elementor-widget elementor-widget-heading" data-id="6ac8868" data-element_type="widget" data-widget_type="heading.default">
              <h1 class="elementor-heading-title elementor-size-xl">${data.heroTitle}</h1>
            </div>
            <div class="elementor-element elementor-element-a97c29c elementor-widget-divider--view-line elementor-widget elementor-widget-divider" data-id="a97c29c" data-element_type="widget" data-widget_type="divider.default">
              <div class="elementor-divider"><span class="elementor-divider-separator"></span></div>
            </div>
            <div class="elementor-element elementor-element-44913aa elementor-widget elementor-widget-text-editor" data-id="44913aa" data-element_type="widget" data-widget_type="text-editor.default">
              <div>${data.heroDescriptionHtml}</div>
            </div>
          </div>
        </div>
        <div class="elementor-element elementor-element-ca25516 elementor-widget elementor-widget-shortcode" data-id="ca25516" data-element_type="widget" data-widget_type="shortcode.default">
          <div class="elementor-shortcode">
            <div class="biomasa-latest-ogloszenia" style="margin:60px 0;">
              <div class="section-header" style="display:flex;justify-content:space-between;align-items:center;gap:18px;margin-bottom:30px;">
                <h2 style="margin:0;color:#2d5c3f;font-size:32px;line-height:1.1;">${data.heroSubtitle}</h2>
                <a class="view-all" href="/ogloszenia" style="display:inline-flex;align-items:center;gap:8px;color:#f3a814;text-decoration:none;font-weight:600;font-size:16px;">
                  Zobacz wszystkie
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7.5 15l5-5-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
                  </svg>
                </a>
              </div>
              <div class="ogloszenia-grid-home" style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px;align-items:stretch;">
                ${cardsHtml}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

function extractHomepagePreviewData(html: string) {
  const raw$ = load(html);
  const rawPageRoot = raw$("[data-elementor-type='wp-page']").first();
  const transformed = transformExportedHtml(html);
  const $ = load(transformed);
  const pageRoot = $("[data-elementor-type='wp-page']").first();
  const rawHeroSection = rawPageRoot.find("[data-id='ec8c212']").first();
  const heroSection = pageRoot.find("[data-id='ec8c212']").first();
  const forestSection = pageRoot.find("[data-id='ef26ff1']").first();
  const latestPostsSection = pageRoot.find("[data-id='64cd8fb']").first();
  const communitySection = pageRoot.find("[data-id='7882e66c']").first();
  const rawAboutSection = rawPageRoot.find("[data-id='8096431']").first();
  const aboutSection = pageRoot.find("[data-id='8096431']").first();
  const rawPartnersSection = rawPageRoot.find("[data-id='daaafec']").first();
  const brandSection = pageRoot.find("[data-id='87f408c']").first();
  const partnersSection = pageRoot.find("[data-id='daaafec']").first();
  const forestSectionHtml = normalizePreviewSectionHtml($.html(forestSection) || "");
  const communitySectionHtml = normalizePreviewSectionHtml($.html(communitySection) || "");
  const aboutSectionHtml = normalizePreviewSectionHtml($.html(aboutSection) || "");
  const brandSectionHtml = normalizePreviewSectionHtml($.html(brandSection) || "");
  const partnersSectionHtml = normalizePreviewSectionHtml($.html(partnersSection) || "");

  const heroTitle =
    heroSection.find("[data-id='6ac8868'] .elementor-heading-title").first().text().trim() ||
    "Biomasaportal.pl - Twój partner na rynku biomasy";
  const heroSubtitle =
    heroSection.find(".section-header h2").first().text().trim() || "Najnowsze ogłoszenia";
  const heroDescriptionHtml =
    heroSection.find("[data-id='44913aa']").first().html()?.trim() || "";

  const heroCards: HeroCard[] = rawHeroSection
    .find(".ogloszenie-card-home")
    .map((_, element) => {
      const node = raw$(element);
      return {
        href: node.find(".card-link").attr("href") ?? "#",
        title: node.find(".card-title").text().trim(),
        image: node.find(".card-image img").attr("src") ?? null,
        price: node.find(".card-price").text().trim() || null,
        location: node.find(".meta-location").text().replace(/\s+/g, " ").trim() || null,
        dateLabel: node.find(".meta-date").text().trim() || null,
      };
    })
    .get()
    .slice(0, 12);

  const forestEyebrow =
    forestSection.find("[data-id='ada63c6'] .elementor-heading-title").first().contents().first().text().trim() ||
    "GEP24.PL";
  const forestTitleHtml = forestSection
    .find("[data-id='ada63c6'] .elementor-heading-title")
    .first()
    .html()
    ?.replace(/^.*?<br>/i, "")
    .trim() || 'Twój dostawca <span style="color: #f3a814">maszyn leśnych</span>';
  const forestDescription =
    forestSection.find("[data-id='0437937'] p").first().text().trim() ||
    "Skorzystaj z oferty przygotowanej przez profesjonalistów dla profesjonalistów!";
  const forestButtonLabel =
    forestSection.find("[data-id='11803d7'] .elementor-button-text").first().text().trim() ||
    "Dowiedz się więcej";
  const forestButtonHref =
    forestSection.find("[data-id='11803d7'] .elementor-button").first().attr("href") ||
    "https://GEP24.PL";

  const communityTitle =
    communitySection.find("[data-id='5bc2bb5e'] .elementor-image-box-title").first().text().trim() ||
    "Dołącz do naszej społeczności na Facebooku";
  const communityPrimaryButtonHref =
    communitySection.find("[data-id='3563b1e4'] .elementor-button").first().attr("href") ||
    "http://www.facebook.com/groups/biomasapellet/";
  const communityPrimaryButtonLabel =
    communitySection.find("[data-id='3563b1e4'] .elementor-button-text").first().text().trim() ||
    "Dołącz";
  const communitySecondaryTitle =
    communitySection.find("[data-id='68c01f31'] .elementor-image-box-title").first().html()?.trim() ||
    "Biomasa | Pellet | Węgiel |<br> skup i sprzedaż";
  const communitySecondaryButtonHref =
    communitySection.find("[data-id='7a9e16c'] .elementor-button").first().attr("href") ||
    "http://www.facebook.com/groups/biomasstrust/";
  const communitySecondaryButtonLabel =
    communitySection.find("[data-id='7a9e16c'] .elementor-button-text").first().text().trim() ||
    "Dołącz";

  const aboutTitle =
    aboutSection.find("[data-id='3e31e4f'] .elementor-heading-title").first().text().trim() ||
    "O nas";
  const aboutLogo = rawAboutSection.find("[data-id='9fb4ebc'] img").first().attr("src") ?? null;
  const aboutParagraphs = aboutSection
    .find("[data-id='b74591d'] p")
    .map((_, element) => $(element).text().replace(/\s+/g, " ").trim())
    .get()
    .filter(Boolean);

  const brandTitle =
    brandSection.find("[data-id='f0296bd'] .elementor-heading-title").first().text().trim() ||
    "BIOMASA PORTAL";

  const partnersTitle =
    partnersSection.find("[data-id='f8e3320'] .elementor-heading-title").first().text().trim() ||
    "Partnerzy portalu";
  const partnersLogo = rawPartnersSection.find("[data-id='41e094f'] img").first().attr("src") ?? null;
  const partners: PartnerLogo[] = rawPartnersSection
    .find("[data-id='6cc0ff0'] .elementor-widget-image")
    .map((_, element) => {
      const node = raw$(element);
      const image = node.find("img").first();
      return {
        href: node.find("a").attr("href") ?? "#",
        image: image.attr("src") ?? null,
        alt: image.attr("alt")?.trim() || "Partner Biomasa Portal",
        width: Number.parseInt(image.attr("width") ?? "", 10) || null,
        height: Number.parseInt(image.attr("height") ?? "", 10) || null,
      };
    })
    .get();
  const pageRootAttributes = { ...(rawPageRoot.get(0)?.attribs ?? {}) };

  heroSection.remove();
  forestSection.remove();
  latestPostsSection.remove();
  communitySection.remove();
  aboutSection.remove();
  brandSection.remove();
  partnersSection.remove();

  return {
    heroTitle,
    heroSubtitle,
    heroDescriptionHtml,
    heroCards,
    forestEyebrow,
    forestTitleHtml,
    forestDescription,
    forestButtonLabel,
    forestButtonHref,
    communityTitle,
    communityPrimaryButtonHref,
    communityPrimaryButtonLabel,
    communitySecondaryTitle,
    communitySecondaryButtonHref,
    communitySecondaryButtonLabel,
    forestSectionHtml,
    aboutTitle,
    aboutLogo,
    aboutParagraphs,
    brandTitle,
    partnersTitle,
    partnersLogo,
    partners,
    communitySectionHtml,
    aboutSectionHtml,
    brandSectionHtml,
    partnersSectionHtml,
    pageRootAttributes,
    remainingHtml: $.html(pageRoot) || transformed,
  };
}

export default async function NativeHomePreviewPage() {
  const [route, blogItems] = await Promise.all([getRouteByPath("/"), getCombinedBlogIndex()]);

  if (!route) {
    return null;
  }

  const previewData = extractHomepagePreviewData(route.html);
  const latestItems = blogItems.slice(0, 8);
  const widgetSignature =
    extractElementorPostsWidgetSignatures(route.html).find((signature) =>
      (signature.attributes.class ?? "").includes("elementor-element-b47130f"),
    ) ?? null;
  const pageRootClassName =
    typeof previewData.pageRootAttributes.class === "string"
      ? previewData.pageRootAttributes.class
      : "elementor elementor-28";
  const pageRootDataProps = Object.fromEntries(
    Object.entries(previewData.pageRootAttributes).filter(([key]) => key !== "class"),
  );
  const latestPostsSectionHtml = buildHomeLatestPostsSectionHtml(latestItems, widgetSignature);

  return (
    <>
      <WordPressBodyClass className={route.bodyClass} />
      <WordPressAssets stylesheets={route.stylesheets} />
      <WordPressSeoScripts schemaJsonLd={route.schemaJsonLd} />
      <style>{`
        body:has(.native-preview-home) .cookie-settings-trigger,
        body:has(.native-preview-home) .cookie-mini-shell,
        body:has(.native-preview-home) .cookie-modal-shell {
          display: none !important;
        }
        body:has(.native-preview-home) nextjs-portal {
          display: none !important;
        }
      `}</style>
      <div
        className="wp-mirror-page native-preview-home"
        style={
          route.openGraph.image
            ? ({
                ["--wp-featured-image" as string]: `url("${route.openGraph.image}")`,
              } as CSSProperties)
            : undefined
        }
      >
        <NativePreviewHeader />
        <div className={`mirror-html ${pageRootClassName}`.trim()} {...pageRootDataProps}>
          <div dangerouslySetInnerHTML={{ __html: buildHeroSectionHtml(previewData) }} />
          <div dangerouslySetInnerHTML={{ __html: previewData.forestSectionHtml }} />
          <div dangerouslySetInnerHTML={{ __html: latestPostsSectionHtml }} />
          <div dangerouslySetInnerHTML={{ __html: previewData.communitySectionHtml }} />
          <div dangerouslySetInnerHTML={{ __html: previewData.aboutSectionHtml }} />
          <div dangerouslySetInnerHTML={{ __html: previewData.brandSectionHtml }} />
          <div dangerouslySetInnerHTML={{ __html: previewData.partnersSectionHtml }} />
          <div dangerouslySetInnerHTML={{ __html: previewData.remainingHtml }} />
        </div>
        <NativePreviewFooter />
      </div>
    </>
  );
}
