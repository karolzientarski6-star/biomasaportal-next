export type EditorialCategory = {
  slug: string;
  name: string;
  shortDescription: string;
  seoTitle: string;
  seoDescription: string;
  bodyDescription: string;
  accentLabel: string;
  keywords: string[];
};

export const EDITORIAL_CATEGORIES: EditorialCategory[] = [
  {
    slug: "pellet",
    name: "Pellet",
    shortDescription: "Ceny, jakość, producenci, certyfikaty i zakupy pelletu w Polsce.",
    seoTitle: "Pellet w Polsce - ceny, producenci i poradniki | BiomasaPortal",
    seoDescription:
      "Archiwum wpisów o pellecie: ceny pelletu, certyfikaty ENplus A1, producenci, jakość paliwa i praktyczne poradniki zakupowe.",
    bodyDescription:
      "W tej kategorii zbieramy wpisy o pellecie drzewnym i agro: aktualne ceny, certyfikaty ENplus A1, porównania producentów, praktyczne kalkulacje kosztów oraz poradniki zakupowe dla gospodarstw domowych i firm. To sekcja budowana stricte pod SEO i intencję użytkownika, dlatego każdy wpis odpowiada na konkretne pytanie zakupowe albo eksploatacyjne.",
    accentLabel: "Rynek pelletu",
    keywords: [
      "pellet",
      "enplus",
      "mako",
      "dankros",
      "tona pelletu",
      "producent pelletu",
    ],
  },
  {
    slug: "piece-i-kotly",
    name: "Piece i kotły",
    shortDescription: "Kotły, piece i palniki na pellet oraz porównania technologii ogrzewania.",
    seoTitle: "Piece i kotły na pellet - poradniki i rankingi | BiomasaPortal",
    seoDescription:
      "Kategorie wpisów o kotłach, piecach i palnikach na pellet: dobór urządzeń, koszty, eksploatacja i rankingi modeli.",
    bodyDescription:
      "Ta sekcja skupia treści o doborze urządzeń grzewczych: piecach na pellet, kotłach klasy 5, palnikach montowanych do starych kotłów oraz realnych opiniach użytkowników po kilku sezonach. Pod gridem zostawiamy rozbudowany opis SEO, żeby archiwum miało własną wartość merytoryczną i nie było tylko zbiorem kart.",
    accentLabel: "Technologia grzewcza",
    keywords: [
      "piec",
      "piece",
      "kociol",
      "kotly",
      "kotły",
      "palnik",
      "ogrzewanie",
    ],
  },
  {
    slug: "zrebka-i-trociny",
    name: "Zrębka i trociny",
    shortDescription: "Zrębka drzewna, trociny i surowce do produkcji biomasy.",
    seoTitle: "Zrębka i trociny - ceny, zastosowanie i rynek | BiomasaPortal",
    seoDescription:
      "Archiwum wpisów o zrębce drzewnej i trocinach: ceny, źródła surowca, zastosowanie przemysłowe i handel biomasą drzewną.",
    bodyDescription:
      "Kategoria porządkuje treści wokół zrębki drzewnej, trocin, suszarni i rynku surowca drzewnego. Z punktu widzenia SEO to ważny klaster tematyczny, bo zbiera frazy transakcyjne, technologiczne i informacyjne związane z handlem biomasą drzewną w Polsce.",
    accentLabel: "Biomasa drzewna",
    keywords: [
      "zrebka",
      "zrębka",
      "trociny",
      "suszarnia",
      "biomasa drzewna",
      "rebaki",
      "rębaki",
    ],
  },
  {
    slug: "biogazownie",
    name: "Biogazownie",
    shortDescription: "Biogazownie rolnicze, inwestycje, przepisy i ekonomika projektów.",
    seoTitle: "Biogazownie w Polsce - koszty, przepisy i rozwój rynku | BiomasaPortal",
    seoDescription:
      "Wpisy o biogazowniach w Polsce: opłacalność, pozwolenia, finansowanie, uciążliwości zapachowe i rozwój rynku biogazu.",
    bodyDescription:
      "Sekcja o biogazowniach odpowiada na pytania inwestorów, samorządów i mieszkańców. Zbieramy tutaj analizy kosztowe, kwestie formalno-prawne, przykłady spółek działających na rynku i treści wyjaśniające kontrowersje wokół biogazu.",
    accentLabel: "Biogaz w Polsce",
    keywords: [
      "biogaz",
      "biogazownia",
      "polska grupa biogazowa",
      "fermentacja",
      "substrat",
    ],
  },
  {
    slug: "dofinansowania",
    name: "Dofinansowania",
    shortDescription: "Dotacje, programy gminne, Czyste Powietrze i uchwały antysmogowe.",
    seoTitle: "Dofinansowania do ogrzewania i biomasy | BiomasaPortal",
    seoDescription:
      "Archiwum wpisów o dofinansowaniach do pieców, kotłów i inwestycji w biomasę: programy gminne, Czyste Powietrze i terminy wymian.",
    bodyDescription:
      "Kategoria skupia ruch z fraz o dotacjach, programach lokalnych, dopłatach do wymiany pieców i obowiązkach wynikających z uchwał antysmogowych. To jeden z najmocniejszych klastrów leadowych, więc pod listingiem dokładamy stały opis SEO z kontekstem i linkowaniem wewnętrznym.",
    accentLabel: "Dotacje i przepisy",
    keywords: [
      "dofinansowanie",
      "dotacja",
      "czyste powietrze",
      "uchwala",
      "uchwała",
      "gminy",
    ],
  },
  {
    slug: "maszyny-lesne",
    name: "Maszyny leśne",
    shortDescription: "Harvestery, forwardery, rębaki i rozdrabniacze dla branży biomasy.",
    seoTitle: "Maszyny leśne - harvestery, forwardery i rębaki | BiomasaPortal",
    seoDescription:
      "Archiwum wpisów o maszynach leśnych i sprzęcie do biomasy: harvestery, forwardery, rębaki, rozdrabniacze i linie technologiczne.",
    bodyDescription:
      "Ta kategoria zbiera wpisy o maszynach leśnych i urządzeniach do przetwarzania biomasy. To naturalne rozszerzenie oferty ogłoszeń i sprzedaży sprzętu, ale prowadzone w formie poradnikowo-seowej, żeby budować topical authority wokół maszyn dla branży leśnej i bioenergetycznej.",
    accentLabel: "Sprzęt i linie technologiczne",
    keywords: [
      "harvester",
      "harwestery",
      "forwardery",
      "forwarder",
      "rębaki",
      "rebaki",
      "rozdrabniacze",
      "maszyny lesne",
      "maszyny leśne",
    ],
  },
  {
    slug: "biomasa",
    name: "Biomasa",
    shortDescription: "Szeroko pojęty rynek biomasy, surowce, porównania i trendy.",
    seoTitle: "Biomasa w Polsce - rynek, surowce i trendy | BiomasaPortal",
    seoDescription:
      "Archiwum wpisów o rynku biomasy w Polsce: paliwa stałe, surowce, logistyka, trendy cenowe i praktyczne zastosowania.",
    bodyDescription:
      "To parasolowa kategoria dla treści o biomasie jako rynku: surowce, technologie, handel, zamienniki dla pelletu i porównania kosztowe. W mega menu pełni rolę szerokiego wejścia do całego klastra „Biomasa w Polsce”.",
    accentLabel: "Rynek biomasy",
    keywords: ["biomasa", "brykiet", "pks", "slonecznika", "słonecznika", "opał"],
  },
];

export function getEditorialCategoryBySlug(slug: string) {
  return EDITORIAL_CATEGORIES.find((category) => category.slug === slug) ?? null;
}

function normalize(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function mapWordPressSectionToEditorialCategory(section: string) {
  const normalizedSection = normalize(section);

  if (!normalizedSection) {
    return null;
  }

  const directMatches: Record<string, string> = {
    pellet: "pellet",
    biogaz: "biogazownie",
    biogazownie: "biogazownie",
    oze: "biomasa",
    biomasa: "biomasa",
    "maszyny lesne": "maszyny-lesne",
    "maszyny leśne": "maszyny-lesne",
    "zrebka i trociny": "zrebka-i-trociny",
    "zrębka i trociny": "zrebka-i-trociny",
    "piece i kotly": "piece-i-kotly",
    "piece i kotły": "piece-i-kotly",
    dofinansowania: "dofinansowania",
  };

  const matchedSlug = directMatches[normalizedSection];
  if (matchedSlug) {
    return getEditorialCategoryBySlug(matchedSlug);
  }

  return (
    EDITORIAL_CATEGORIES.find((category) =>
      category.keywords.some((token) => normalizedSection.includes(normalize(token))),
    ) ?? null
  );
}

export function inferEditorialCategory(
  keyword: string,
  title: string,
  html: string,
) {
  const haystack = `${keyword} ${title} ${html}`.toLowerCase();

  const matchedCategory = EDITORIAL_CATEGORIES.find((category) =>
    category.keywords.some((token) => haystack.includes(token.toLowerCase())),
  );

  return matchedCategory ?? getEditorialCategoryBySlug("biomasa");
}
