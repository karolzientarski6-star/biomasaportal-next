import type { CSSProperties } from "react";
import { NativePreviewFooter } from "@/components/native-preview-footer";
import { NativePreviewHeader } from "@/components/native-preview-header";
import { WordPressAssets } from "@/components/wordpress-assets";
import { WordPressBodyClass } from "@/components/wordpress-body-class";
import { WordPressInteractiveEnhancer } from "@/components/wordpress-interactive-enhancer";
import { WordPressSeoScripts } from "@/components/wordpress-seo-scripts";
import type { ExportedRoute } from "@/lib/wordpress-export";

type NativePublicPageFrameProps = {
  path: string;
  route: ExportedRoute;
  children: React.ReactNode;
};

export function NativePublicPageFrame({
  path,
  route,
  children,
}: NativePublicPageFrameProps) {
  return (
    <>
      <WordPressBodyClass className={route.bodyClass} />
      <WordPressAssets stylesheets={route.stylesheets} />
      <WordPressSeoScripts schemaJsonLd={route.schemaJsonLd} />
      <WordPressInteractiveEnhancer path={path} />
      <div
        className={`wp-mirror-page native-public-page${route.bodyClass.includes("single-post") ? " wp-mirror-page--single-post" : ""}`}
        style={
          route.openGraph.image
            ? ({
                ["--wp-featured-image" as string]: `url("${route.openGraph.image}")`,
              } as CSSProperties)
            : undefined
        }
      >
        <NativePreviewHeader />
        <div className="native-public-page__main">{children}</div>
        <NativePreviewFooter />
      </div>
    </>
  );
}
