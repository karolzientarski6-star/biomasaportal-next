import Link from "next/link";
import { load } from "cheerio";
import { notFound } from "next/navigation";
import { normalizeWpImageUrl } from "@/lib/html-transform";
import {
  getClassifiedCategories,
  getClassifieds,
  type ExportedClassified,
  type ExportedClassifiedCategory,
  type ExportedRoute,
} from "@/lib/wordpress-export";
import { SiteShell } from "@/components/site-shell";

type ClassifiedViewModel = {
  title: string;
  descriptionHtml: string;
  images: string[];
  location: string | null;
  ageLabel: string | null;
  viewsLabel: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  phone: string | null;
  email: string | null;
  relatedItems: ExportedClassified[];
};

function normalizeRouteHref(href: string | undefined) {
  if (!href) {
    return null;
  }

  if (href.startsWith("https://biomasaportal.pl")) {
    const parsed = new URL(href);
    return `${parsed.pathname}${parsed.search}${parsed.hash}` || "/";
  }

  return href;
}

function parseClassifiedRoute(route: ExportedRoute, item: ExportedClassified) {
  const $ = load(route.html);
  const imageUrls = new Set<string>();

  $(".product-images img").each((_, element) => {
    const image = $(element);
    const src =
      image.attr("src") ??
      image.attr("data-src") ??
      image.attr("srcset")?.split(",")[0]?.trim().split(" ")[0] ??
      null;

    if (!src) {
      return;
    }

    const normalized = normalizeWpImageUrl(src);
    if (normalized) {
      imageUrls.add(normalized);
    }
  });

  const metaItems = $(".product-meta-top .meta-item")
    .map((_, element) => $(element).text().replace(/\s+/g, " ").trim())
    .get();

  const categoryLink = $(".product-categories .category-badge").first();
  const phoneLink = $(".product-contact a[href^='tel:']").first();
  const emailLink = $(".product-contact a[href^='mailto:']").first();
  const descriptionHtml =
    $(".product-description .description-content").html() ??
    `<p>${item.excerpt}</p>`;

  return {
    title: $(".product-title").first().text().replace(/\s+/g, " ").trim() || item.title,
    descriptionHtml,
    images: [...imageUrls],
    location: metaItems[0] ?? item.location,
    ageLabel: metaItems[1] ?? null,
    viewsLabel: metaItems[2] ?? `${item.viewsCount} wyswietlen`,
    categoryName:
      categoryLink.text().replace(/\s+/g, " ").trim() || item.categoryNames[0] || null,
    categorySlug: normalizeRouteHref(categoryLink.attr("href"))
      ?.replace(/^\/kategoria-ogloszenia\//, "")
      .replace(/\/$/, "") ?? null,
    phone:
      phoneLink.attr("href")?.replace(/^tel:/, "").trim() || item.phone || null,
    email:
      emailLink.attr("href")?.replace(/^mailto:/, "").trim() || item.email || null,
  };
}

function formatCurrency(value?: number | null) {
  if (!value) {
    return "Cena do ustalenia";
  }

  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 2,
  }).format(value);
}

function buildCategoryMap(categories: ExportedClassifiedCategory[]) {
  return new Map(categories.map((category) => [category.slug, category]));
}

function rankRelatedItems(
  current: ExportedClassified,
  allItems: ExportedClassified[],
  categoryName: string | null,
) {
  return allItems
    .filter((item) => item.path !== current.path)
    .sort((left, right) => {
      const leftScore = categoryName && left.categoryNames.includes(categoryName) ? 1 : 0;
      const rightScore = categoryName && right.categoryNames.includes(categoryName) ? 1 : 0;

      if (leftScore !== rightScore) {
        return rightScore - leftScore;
      }

      return right.id - left.id;
    })
    .slice(0, 4);
}

export async function NativeClassifiedPage({
  route,
  slug,
}: {
  route: ExportedRoute;
  slug: string;
}) {
  const [items, categories] = await Promise.all([
    getClassifieds(),
    getClassifiedCategories(),
  ]);
  const item =
    items.find((candidate) => candidate.slug === slug) ??
    items.find((candidate) => candidate.path === route.path) ??
    null;

  if (!item) {
    notFound();
  }

  const parsed = parseClassifiedRoute(route, item);
  const categoryMap = buildCategoryMap(categories);
  const currentCategory =
    parsed.categorySlug ? categoryMap.get(parsed.categorySlug) ?? null : null;
  const relatedItems = rankRelatedItems(item, items, parsed.categoryName);
  const viewModel: ClassifiedViewModel = {
    ...parsed,
    relatedItems,
    categoryName: currentCategory?.name ?? parsed.categoryName,
  };

  return (
    <SiteShell>
      <div className="custom-page native-classified-page">
        <nav className="classified-breadcrumbs" aria-label="Breadcrumbs">
          <Link href="/">Strona glowna</Link>
          <span>/</span>
          <Link href="/ogloszenia/">Ogloszenia</Link>
          {viewModel.categoryName && viewModel.categorySlug ? (
            <>
              <span>/</span>
              <Link href={`/kategoria-ogloszenia/${viewModel.categorySlug}/`}>
                {viewModel.categoryName}
              </Link>
            </>
          ) : null}
          <span>/</span>
          <span>{viewModel.title}</span>
        </nav>

        <section className="classified-single-layout">
          <div className="classified-single-gallery page-card">
            <div className="classified-single-gallery__main">
              {viewModel.images[0] ? (
                <img
                  src={viewModel.images[0]}
                  alt={viewModel.title}
                  loading="eager"
                  decoding="async"
                />
              ) : null}
            </div>
            {viewModel.images.length > 1 ? (
              <div className="classified-single-gallery__thumbs">
                {viewModel.images.slice(0, 5).map((image) => (
                  <div key={image} className="classified-single-gallery__thumb">
                    <img src={image} alt={viewModel.title} loading="lazy" decoding="async" />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <article className="classified-single-summary page-card">
            <div className="page-card__body">
              <p className="page-card__eyebrow">Ogloszenie</p>
              <h1>{viewModel.title}</h1>
              <div className="classified-single-summary__meta">
                {viewModel.location ? <span>{viewModel.location}</span> : null}
                {viewModel.ageLabel ? <span>{viewModel.ageLabel}</span> : null}
                {viewModel.viewsLabel ? <span>{viewModel.viewsLabel}</span> : null}
              </div>
              <div className="classified-single-summary__badges">
                {viewModel.categoryName && viewModel.categorySlug ? (
                  <Link
                    href={`/kategoria-ogloszenia/${viewModel.categorySlug}/`}
                    className="pill"
                  >
                    {viewModel.categoryName}
                  </Link>
                ) : null}
                {item.featured ? <span className="pill">Wyroznione</span> : null}
                <span className="pill">{formatCurrency(item.price)}</span>
              </div>

              <section className="classified-contact-card">
                <h2>Kontakt</h2>
                <div className="classified-contact-card__list">
                  {viewModel.phone ? (
                    <a href={`tel:${viewModel.phone}`} className="classified-contact-card__item">
                      {viewModel.phone}
                    </a>
                  ) : null}
                  {viewModel.email ? (
                    <a
                      href={`mailto:${viewModel.email}`}
                      className="classified-contact-card__item"
                    >
                      {viewModel.email}
                    </a>
                  ) : null}
                </div>
                <div className="classified-contact-card__actions">
                  {viewModel.phone ? (
                    <a href={`tel:${viewModel.phone}`} className="site-nav__cta">
                      Zadzwoń teraz
                    </a>
                  ) : null}
                  {viewModel.email ? (
                    <a
                      href={`mailto:${viewModel.email}`}
                      className="home-hero__secondary classified-contact-card__secondary"
                    >
                      Wyslij wiadomosc
                    </a>
                  ) : null}
                </div>
              </section>
            </div>
          </article>
        </section>

        <section className="page-card">
          <div className="page-card__header">
            <p className="page-card__eyebrow">Opis</p>
            <h2>Szczegoly ogloszenia</h2>
          </div>
          <div
            className="page-card__body mirror-html classified-description"
            dangerouslySetInnerHTML={{ __html: viewModel.descriptionHtml }}
          />
        </section>

        {viewModel.relatedItems.length > 0 ? (
          <section className="page-card">
            <div className="page-card__header">
              <p className="page-card__eyebrow">Powiazane oferty</p>
              <h2>Pozostale ogloszenia</h2>
            </div>
            <div className="page-card__body">
              <div className="home-classified-grid">
                {viewModel.relatedItems.map((related) => (
                  <Link key={related.id} href={related.path} className="home-classified-card">
                    <div className="home-classified-card__image">
                      {normalizeWpImageUrl(related.image) ? (
                        <img
                          src={normalizeWpImageUrl(related.image)!}
                          alt={related.title}
                          loading="lazy"
                          decoding="async"
                        />
                      ) : null}
                    </div>
                    <div className="home-classified-card__body">
                      <div className="home-classified-card__pills">
                        {related.categoryNames.slice(0, 1).map((name) => (
                          <span key={name}>{name}</span>
                        ))}
                      </div>
                      <h3>{related.title}</h3>
                      <p>{related.excerpt}</p>
                      <div className="home-classified-card__meta">
                        <strong>{formatCurrency(related.price)}</strong>
                        <span>{related.viewsCount} wyswietlen</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </SiteShell>
  );
}
