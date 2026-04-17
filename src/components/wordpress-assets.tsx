import { DeferredStylesheetLoader } from "@/components/deferred-stylesheet-loader";

type WordPressAssetsProps = {
  stylesheets?: string[];
};

const DEFERRED_STYLESHEET_PATTERNS = [
  "fonts.googleapis.com/css",
  "/plugins/elementor/assets/css/widget-icon-list.min.css",
  "/plugins/elementor/assets/css/widget-divider.min.css",
  "/plugins/elementor/assets/css/widget-spacer.min.css",
  "/plugins/elementor/assets/css/widget-menu-anchor.min.css",
  "/plugins/elementor/assets/css/widget-image-box.min.css",
  "/plugins/elementor/assets/css/widget-post-info.min.css",
  "/plugins/elementor/assets/css/widget-search-form.min.css",
  "/plugins/elementor/assets/css/conditionals/shapes.min.css",
  "/plugins/woocommerce/assets/client/blocks/wc-blocks.css",
];

function isDeferredStylesheet(href: string) {
  return DEFERRED_STYLESHEET_PATTERNS.some((pattern) => href.includes(pattern));
}

export function WordPressAssets({ stylesheets = [] }: WordPressAssetsProps) {
  const hasGoogleFonts = stylesheets.some((href) =>
    href.includes("fonts.googleapis.com"),
  );
  const criticalStylesheets = stylesheets.filter((href) => !isDeferredStylesheet(href));
  const deferredStylesheets = stylesheets.filter((href) => isDeferredStylesheet(href));

  return (
    <>
      {hasGoogleFonts ? (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
          <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        </>
      ) : null}
      {criticalStylesheets.map((href) => (
        <link
          key={href}
          rel="stylesheet"
          href={href}
          precedence="default"
        />
      ))}
      <DeferredStylesheetLoader hrefs={deferredStylesheets} />
    </>
  );
}
