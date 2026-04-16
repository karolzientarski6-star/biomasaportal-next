import Link from "next/link";
import { load } from "cheerio";
import { notFound } from "next/navigation";
import { normalizeWpImageUrl } from "@/lib/html-transform";
import { getProductBySlug, getProductIndex, type ProductIndexItem } from "@/lib/products";
import { SiteShell } from "@/components/site-shell";

function parseProductGallery(html: string) {
  const $ = load(html);
  const images = new Set<string>();

  $(".woocommerce-product-gallery__image").each((_, element) => {
    const image = $(element).find("img").first();
    const src =
      image.attr("data-large_image") ??
      image.attr("data-src") ??
      image.attr("src") ??
      $(element).find("a").first().attr("href") ??
      null;

    const normalized = normalizeWpImageUrl(src);
    if (normalized) {
      images.add(normalized);
    }
  });

  return [...images];
}

function parseProductDescription(html: string) {
  const $ = load(html);
  return (
    $(".woocommerce-product-details__short-description").html() ??
    "<p>Skontaktuj sie z nami, aby otrzymac szczegoly tej oferty.</p>"
  );
}

function parseProductLeadCta(html: string) {
  const $ = load(html);
  const button = $("a.elementor-button")
    .filter((_, element) =>
      $(element).text().replace(/\s+/g, " ").trim().includes("Zapytaj"),
    )
    .first();

  return {
    href: button.attr("href") ?? null,
    label: button.text().replace(/\s+/g, " ").trim() || "Zapytaj o oferte",
  };
}

function parseRelatedProducts(html: string) {
  const $ = load(html);

  return $(".related.products li.product")
    .map((_, element) => {
      const product = $(element);
      const link = product.find("a.woocommerce-LoopProduct-link").first();
      const href = link.attr("href");

      if (!href) {
        return null;
      }

      return {
        path: href.startsWith("https://biomasaportal.pl")
          ? new URL(href).pathname.endsWith("/")
            ? new URL(href).pathname
            : `${new URL(href).pathname}/`
          : href,
        title: product.find(".woocommerce-loop-product__title").first().text().trim(),
        image: normalizeWpImageUrl(product.find("img").first().attr("src") ?? null),
      };
    })
    .get()
    .filter(Boolean) as Array<{ path: string; title: string; image: string | null }>;
}

function rankRelatedProducts(
  items: ProductIndexItem[],
  currentPath: string,
  categorySlug: string | null,
) {
  return items
    .filter((item) => item.path !== currentPath)
    .sort((left, right) => {
      const leftScore = categorySlug && left.categorySlug === categorySlug ? 1 : 0;
      const rightScore = categorySlug && right.categorySlug === categorySlug ? 1 : 0;

      if (leftScore !== rightScore) {
        return rightScore - leftScore;
      }

      return left.title.localeCompare(right.title);
    })
    .slice(0, 3);
}

export async function NativeProductPage({ slug }: { slug: string }) {
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const { route, item } = product;
  const products = await getProductIndex();
  const gallery = parseProductGallery(route.html);
  const descriptionHtml = parseProductDescription(route.html);
  const leadCta = parseProductLeadCta(route.html);
  const related = rankRelatedProducts(products, route.path, item?.categorySlug ?? null);
  const parsedRelated = parseRelatedProducts(route.html);

  return (
    <SiteShell>
      <div className="custom-page native-product-page">
        <nav className="classified-breadcrumbs" aria-label="Breadcrumbs">
          <Link href="/">Strona glowna</Link>
          <span>/</span>
          <Link href="/shop/">Sprzedaz maszyn lesnych</Link>
          {item?.categoryName ? (
            <>
              <span>/</span>
              <span>{item.categoryName}</span>
            </>
          ) : null}
          <span>/</span>
          <span>{item?.title ?? route.openGraph.title}</span>
        </nav>

        <section className="classified-single-layout product-single-layout">
          <div className="classified-single-gallery page-card">
            <div className="classified-single-gallery__main">
              {gallery[0] ? (
                <img src={gallery[0]} alt={item?.title ?? route.openGraph.title} />
              ) : null}
            </div>
            {gallery.length > 1 ? (
              <div className="classified-single-gallery__thumbs">
                {gallery.slice(0, 6).map((image) => (
                  <div key={image} className="classified-single-gallery__thumb">
                    <img
                      src={image}
                      alt={item?.title ?? route.openGraph.title}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <article className="classified-single-summary page-card">
            <div className="page-card__body">
              <p className="page-card__eyebrow">Maszyny lesne</p>
              <h1>{item?.title ?? route.openGraph.title}</h1>
              {item?.categoryName ? (
                <div className="classified-single-summary__badges">
                  <span className="pill">{item.categoryName}</span>
                </div>
              ) : null}
              <p className="product-single-summary__lead">
                {item?.excerpt ||
                  "Skontaktuj sie z nami, aby otrzymac komplet danych technicznych i przygotowac wycene tej maszyny."}
              </p>

              <section className="classified-contact-card">
                <h2>Zapytaj o oferte</h2>
                <p>
                  Ta sekcja prowadzi ruch sprzedażowy na kontakt i wycene maszyny.
                  Zachowujemy stary URL, ale frontend jest juz natywny.
                </p>
                <div className="classified-contact-card__actions">
                  <Link href="/zaloguj-sie/" className="site-nav__cta">
                    {leadCta.label}
                  </Link>
                  <a
                    href="mailto:kontakt@biomasaportal.pl"
                    className="home-hero__secondary classified-contact-card__secondary"
                  >
                    kontakt@biomasaportal.pl
                  </a>
                </div>
              </section>
            </div>
          </article>
        </section>

        <section className="page-card">
          <div className="page-card__header">
            <p className="page-card__eyebrow">Dane techniczne</p>
            <h2>Specyfikacja maszyny</h2>
          </div>
          <div
            className="page-card__body mirror-html product-description"
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        </section>

        <section className="page-card">
          <div className="page-card__header">
            <p className="page-card__eyebrow">Powiazane oferty</p>
            <h2>Podobne produkty</h2>
          </div>
          <div className="page-card__body">
            <div className="product-grid">
              {(parsedRelated.length > 0 ? parsedRelated : related).map((relatedItem) => (
                <Link key={relatedItem.path} href={relatedItem.path} className="product-card">
                  <div className="product-card__image">
                    {relatedItem.image ? (
                      <img
                        src={relatedItem.image}
                        alt={relatedItem.title}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : null}
                  </div>
                  <div className="product-card__body">
                    <h3>{relatedItem.title}</h3>
                    <span className="product-card__cta">Dowiedz sie wiecej</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
