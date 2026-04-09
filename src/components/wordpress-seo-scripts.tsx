type WordPressSeoScriptsProps = {
  schemaJsonLd?: string[];
};

export function WordPressSeoScripts({
  schemaJsonLd = [],
}: WordPressSeoScriptsProps) {
  if (schemaJsonLd.length === 0) {
    return null;
  }

  return (
    <>
      {schemaJsonLd.map((schema, index) => (
        <script
          key={`${index}-${schema.length}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
        />
      ))}
    </>
  );
}
