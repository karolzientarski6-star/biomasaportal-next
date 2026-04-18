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
  route?: ExportedRoute | null;
  bodyClass?: string;
  stylesheets?: string[];
  schemaJsonLd?: string[];
  featuredImage?: string | null;
  isSinglePost?: boolean;
  children: React.ReactNode;
};

export function NativePublicPageFrame({
  path,
  route,
  bodyClass: providedBodyClass,
  stylesheets: providedStylesheets,
  schemaJsonLd: providedSchemaJsonLd,
  featuredImage,
  isSinglePost = false,
  children,
}: NativePublicPageFrameProps) {
  const bodyClass = providedBodyClass ?? route?.bodyClass ?? "";
  const stylesheets = providedStylesheets ?? route?.stylesheets ?? [];
  const schemaJsonLd = providedSchemaJsonLd ?? route?.schemaJsonLd ?? [];
  const openGraphImage = featuredImage ?? route?.openGraph.image ?? null;
  const singlePost = isSinglePost || bodyClass.includes("single-post");

  return (
    <>
      <WordPressBodyClass className={bodyClass} />
      <WordPressAssets stylesheets={stylesheets} />
      <WordPressSeoScripts schemaJsonLd={schemaJsonLd} />
      <WordPressInteractiveEnhancer path={path} />
      <div
        className={`wp-mirror-page native-public-page${singlePost ? " wp-mirror-page--single-post" : ""}`}
        style={
          openGraphImage
            ? ({
                ["--wp-featured-image" as string]: `url("${openGraphImage}")`,
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
