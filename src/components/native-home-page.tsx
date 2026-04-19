import type { CSSProperties } from "react";
import {
  NativeHomeAboutSection,
  NativeHomeBrandSection,
  NativeHomeCommunitySection,
  NativeHomeForestSection,
  NativeHomeHeroSection,
  NativeHomeLatestPostsSection,
  NativeHomePartnersSection,
} from "@/components/native-home-sections";
import { NativePreviewFooter } from "@/components/native-preview-footer";
import { NativePreviewHeader } from "@/components/native-preview-header";
import { WordPressBodyClass } from "@/components/wordpress-body-class";
import { WordPressSeoScripts } from "@/components/wordpress-seo-scripts";
import { getCombinedBlogIndex } from "@/lib/blog-index";
import { extractNativeHomepageData } from "@/lib/native-homepage";
import type { ExportedRoute } from "@/lib/wordpress-export";

type NativeHomePageProps = {
  route: ExportedRoute;
};

export async function NativeHomePage({ route }: NativeHomePageProps) {
  const blogItems = await getCombinedBlogIndex();
  const latestItems = blogItems.slice(0, 8);
  const homeData = extractNativeHomepageData(route.html);

  return (
    <>
      <WordPressBodyClass className={route.bodyClass} />
      <WordPressSeoScripts schemaJsonLd={route.schemaJsonLd} />
      <div
        className={`wp-mirror-page native-preview-home${route.bodyClass.includes("single-post") ? " wp-mirror-page--single-post" : ""}`}
        style={
          route.openGraph.image
            ? ({
                ["--wp-featured-image" as string]: `url("${route.openGraph.image}")`,
              } as CSSProperties)
            : undefined
        }
      >
        <NativePreviewHeader />
        <main className="native-homepage">
          <NativeHomeHeroSection
            title={homeData.heroTitle}
            subtitle={homeData.heroSubtitle}
            descriptionHtml={homeData.heroDescriptionHtml}
            cards={homeData.heroCards}
          />
          <NativeHomeForestSection
            eyebrow={homeData.forestEyebrow}
            titleHtml={homeData.forestTitleHtml}
            description={homeData.forestDescription}
            buttonLabel={homeData.forestButtonLabel}
            buttonHref={homeData.forestButtonHref}
          />
          <NativeHomeLatestPostsSection
            items={latestItems}
          />
          <NativeHomeCommunitySection
            title={homeData.communityTitle}
            primaryButtonHref={homeData.communityPrimaryButtonHref}
            primaryButtonLabel={homeData.communityPrimaryButtonLabel}
            secondaryTitle={homeData.communitySecondaryTitle}
            secondaryButtonHref={homeData.communitySecondaryButtonHref}
            secondaryButtonLabel={homeData.communitySecondaryButtonLabel}
          />
          <NativeHomeAboutSection
            title={homeData.aboutTitle}
            logo={homeData.aboutLogo}
            paragraphs={homeData.aboutParagraphs}
          />
          <NativeHomeBrandSection title={homeData.brandTitle} />
          <NativeHomePartnersSection
            title={homeData.partnersTitle}
            logo={homeData.partnersLogo}
            partners={homeData.partners}
          />
        </main>
        <NativePreviewFooter />
      </div>
    </>
  );
}
