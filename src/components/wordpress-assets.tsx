type WordPressAssetsProps = {
  stylesheets?: string[];
};

export function WordPressAssets({ stylesheets = [] }: WordPressAssetsProps) {
  return (
    <>
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
