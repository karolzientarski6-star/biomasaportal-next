type WordPressAssetsProps = {
  stylesheets?: string[];
};

export function WordPressAssets({ stylesheets = [] }: WordPressAssetsProps) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
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
