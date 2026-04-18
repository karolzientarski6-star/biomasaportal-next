import { load } from "cheerio";

export type NativeHomeHeroCard = {
  href: string;
  title: string;
  image: string | null;
  price: string | null;
  location: string | null;
  dateLabel: string | null;
};

export type NativeHomePartnerLogo = {
  href: string;
  image: string | null;
  alt: string;
  width: number | null;
  height: number | null;
};

export type NativeHomepageData = {
  pageRootClassName: string;
  pageRootDataProps: Record<string, string>;
  heroTitle: string;
  heroSubtitle: string;
  heroDescriptionHtml: string;
  heroCards: NativeHomeHeroCard[];
  forestEyebrow: string;
  forestTitleHtml: string;
  forestDescription: string;
  forestButtonLabel: string;
  forestButtonHref: string;
  communityTitle: string;
  communityPrimaryButtonHref: string;
  communityPrimaryButtonLabel: string;
  communitySecondaryTitle: string;
  communitySecondaryButtonHref: string;
  communitySecondaryButtonLabel: string;
  communityHtml: string;
  aboutTitle: string;
  aboutLogo: string | null;
  aboutParagraphs: string[];
  aboutHtml: string;
  brandTitle: string;
  brandHtml: string;
  partnersTitle: string;
  partnersLogo: string | null;
  partners: NativeHomePartnerLogo[];
  partnersHtml: string;
};

export function extractNativeHomepageData(html: string): NativeHomepageData {
  const raw$ = load(html);
  const rawPageRoot = raw$("[data-elementor-type='wp-page']").first();

  const heroSection = rawPageRoot.find("[data-id='ec8c212']").first();
  const forestSection = rawPageRoot.find("[data-id='ef26ff1']").first();
  const communitySection = rawPageRoot.find("[data-id='7882e66c']").first();
  const aboutSection = rawPageRoot.find("[data-id='8096431']").first();
  const brandSection = rawPageRoot.find("[data-id='87f408c']").first();
  const partnersSection = rawPageRoot.find("[data-id='daaafec']").first();

  const pageRootAttributes = { ...(rawPageRoot.get(0)?.attribs ?? {}) };
  const pageRootClassName =
    typeof pageRootAttributes.class === "string"
      ? pageRootAttributes.class
      : "elementor elementor-28";
  const pageRootDataProps = Object.fromEntries(
    Object.entries(pageRootAttributes).filter(
      ([key, value]) => key !== "class" && typeof value === "string",
    ),
  ) as Record<string, string>;

  const heroTitle =
    heroSection
      .find("[data-id='6ac8868'] .elementor-heading-title")
      .first()
      .text()
      .trim() || "Biomasaportal.pl - Twój partner na rynku biomasy";
  const heroSubtitle =
    heroSection.find(".section-header h2").first().text().trim() ||
    "Najnowsze ogłoszenia";
  const heroDescriptionHtml =
    heroSection.find("[data-id='44913aa']").first().html()?.trim() || "";

  const heroCards: NativeHomeHeroCard[] = heroSection
    .find(".ogloszenie-card-home")
    .map((_, element) => {
      const node = raw$(element);
      return {
        href: node.find(".card-link").attr("href") ?? "#",
        title: node.find(".card-title").text().trim(),
        image: node.find(".card-image img").attr("src") ?? null,
        price: node.find(".card-price").text().trim() || null,
        location:
          node
            .find(".meta-location")
            .text()
            .replace(/\s+/g, " ")
            .trim() || null,
        dateLabel: node.find(".meta-date").text().trim() || null,
      };
    })
    .get()
    .slice(0, 12);

  const forestEyebrow =
    forestSection
      .find("[data-id='ada63c6'] .elementor-heading-title")
      .first()
      .contents()
      .first()
      .text()
      .trim() || "GEP24.PL";
  const forestTitleHtml =
    forestSection
      .find("[data-id='ada63c6'] .elementor-heading-title")
      .first()
      .html()
      ?.replace(/^.*?<br>/i, "")
      .trim() ||
    'Twój dostawca <span style="color: #f3a814">maszyn leśnych</span>';
  const forestDescription =
    forestSection.find("[data-id='0437937'] p").first().text().trim() ||
    "Skorzystaj z oferty przygotowanej przez profesjonalistów dla profesjonalistów!";
  const forestButtonLabel =
    forestSection
      .find("[data-id='11803d7'] .elementor-button-text")
      .first()
      .text()
      .trim() || "Dowiedz się więcej";
  const forestButtonHref =
    forestSection.find("[data-id='11803d7'] .elementor-button").first().attr("href") ||
    "https://GEP24.PL";

  const communityTitle =
    communitySection
      .find("[data-id='5bc2bb5e'] .elementor-image-box-title")
      .first()
      .text()
      .trim() || "Dołącz do naszej społeczności na Facebooku";
  const communityPrimaryButtonHref =
    communitySection
      .find("[data-id='3563b1e4'] .elementor-button")
      .first()
      .attr("href") || "http://www.facebook.com/groups/biomasapellet/";
  const communityPrimaryButtonLabel =
    communitySection
      .find("[data-id='3563b1e4'] .elementor-button-text")
      .first()
      .text()
      .trim() || "Dołącz";
  const communitySecondaryTitle =
    communitySection
      .find("[data-id='68c01f31'] .elementor-image-box-title")
      .first()
      .html()
      ?.trim() || "Biomasa | Pellet | Węgiel |<br> skup i sprzedaż";
  const communitySecondaryButtonHref =
    communitySection
      .find("[data-id='7a9e16c'] .elementor-button")
      .first()
      .attr("href") || "http://www.facebook.com/groups/biomasstrust/";
  const communitySecondaryButtonLabel =
    communitySection
      .find("[data-id='7a9e16c'] .elementor-button-text")
      .first()
      .text()
      .trim() || "Dołącz";

  const communityHtml = raw$.html(communitySection) ?? "";

  const aboutTitle =
    aboutSection
      .find("[data-id='3e31e4f'] .elementor-heading-title")
      .first()
      .text()
      .trim() || "O nas";
  const aboutLogo =
    aboutSection.find("[data-id='9fb4ebc'] img").first().attr("src") ?? null;
  const aboutParagraphs = aboutSection
    .find("[data-id='b74591d'] p")
    .map((_, element) =>
      raw$(element).text().replace(/\s+/g, " ").trim(),
    )
    .get()
    .filter(Boolean);

  const aboutHtml = raw$.html(aboutSection) ?? "";

  const brandTitle =
    brandSection
      .find("[data-id='f0296bd'] .elementor-heading-title")
      .first()
      .text()
      .trim() || "BIOMASA PORTAL";

  const brandHtml = raw$.html(brandSection) ?? "";

  const partnersTitle =
    partnersSection
      .find("[data-id='f8e3320'] .elementor-heading-title")
      .first()
      .text()
      .trim() || "Partnerzy portalu";
  const partnersLogo =
    partnersSection.find("[data-id='41e094f'] img").first().attr("src") ?? null;
  const partners: NativeHomePartnerLogo[] = partnersSection
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

  const partnersHtml = raw$.html(partnersSection) ?? "";

  return {
    pageRootClassName,
    pageRootDataProps,
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
    communityHtml,
    aboutTitle,
    aboutLogo,
    aboutParagraphs,
    aboutHtml,
    brandTitle,
    brandHtml,
    partnersTitle,
    partnersLogo,
    partners,
    partnersHtml,
  };
}
