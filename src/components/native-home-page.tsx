import type { CSSProperties } from "react";
import {
  NativeHomeForestSection,
  NativeHomeHeroSection,
  NativeHomeLatestPostsSection,
  NativeHomePartnersSection,
} from "@/components/native-home-sections";
import { MirrorHtml } from "@/components/mirror-html";
import { NativePreviewFooter } from "@/components/native-preview-footer";
import { NativePreviewHeader } from "@/components/native-preview-header";
import { WordPressAssets } from "@/components/wordpress-assets";
import { WordPressBodyClass } from "@/components/wordpress-body-class";
import { WordPressSeoScripts } from "@/components/wordpress-seo-scripts";
import { getCombinedBlogIndex } from "@/lib/blog-index";
import { extractElementorPostsWidgetSignatures } from "@/lib/elementor-posts-widget";
import { extractNativeHomepageData } from "@/lib/native-homepage";
import type { ExportedRoute } from "@/lib/wordpress-export";

type NativeHomePageProps = {
  route: ExportedRoute;
};

function filterNativeChromeStylesheets(stylesheets: string[]) {
  return stylesheets.filter(
    (href) =>
      !href.includes("/themes/hello-elementor/header-footer.min.css") &&
      !href.includes("/plugins/elementor-pro/assets/css/widget-nav-menu.min.css") &&
      !href.includes("/plugins/elementor-pro/assets/css/widget-off-canvas.min.css") &&
      !href.includes("/plugins/elementor-pro/assets/css/modules/sticky.min.css"),
  );
}

export async function NativeHomePage({ route }: NativeHomePageProps) {
  const blogItems = await getCombinedBlogIndex();
  const latestItems = blogItems.slice(0, 8);
  const homeData = extractNativeHomepageData(route.html);
  const widgetSignature =
    extractElementorPostsWidgetSignatures(route.html).find((signature) =>
      (signature.attributes.class ?? "").includes("elementor-element-b47130f"),
    ) ?? null;

  return (
    <>
      <WordPressBodyClass className={route.bodyClass} />
      <WordPressAssets stylesheets={filterNativeChromeStylesheets(route.stylesheets)} />
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
        <div
          className={`mirror-html ${homeData.pageRootClassName}`.trim()}
          {...homeData.pageRootDataProps}
        >
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
            widgetSignature={widgetSignature}
          />
          <MirrorHtml html={homeData.communityHtml} />
          <MirrorHtml html={homeData.aboutHtml} />
          <MirrorHtml html={homeData.brandHtml} />
          <NativeHomePartnersSection
            title={homeData.partnersTitle}
            logo={homeData.partnersLogo}
            partners={homeData.partners}
          />
        </div>
        <NativePreviewFooter />
      </div>
    </>
  );
}
