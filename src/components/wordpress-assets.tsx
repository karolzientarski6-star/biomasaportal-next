type WordPressAssetsProps = {
  stylesheets?: string[];
};

export function WordPressAssets({ stylesheets = [] }: WordPressAssetsProps) {
  const hasGoogleFonts = stylesheets.some((href) =>
    href.includes("fonts.googleapis.com"),
  );

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
      {stylesheets.map((href) => (
        <link
          key={href}
          rel="stylesheet"
          href={href}
          precedence="default"
        />
      ))}
    </>
  );
}
