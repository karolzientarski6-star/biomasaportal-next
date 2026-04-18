import Link from "next/link";
import { SiteShell } from "./site-shell";
import { getClassifieds, type ExportedClassified } from "@/lib/wordpress-export";
import { getOptimizedWpImageUrl, resolveWpImageUrl } from "@/lib/wp-image-variants";

type NativeClassifiedPageProps = {
  item: ExportedClassified;
};

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

export async function NativeClassifiedPage({
  item,
}: NativeClassifiedPageProps) {
  const allItems = await getClassifieds();
  const sameCategory = allItems.filter(
    (candidate) =>
      candidate.path !== item.path &&
      candidate.categoryNames.some((name) => item.categoryNames.includes(name)),
  );
  const fallback = allItems.filter(
    (candidate) =>
      candidate.path !== item.path &&
      !sameCategory.some((related) => related.path === candidate.path),
  );
  const sidebarItems = [...sameCategory, ...fallback].slice(0, 3);
  const heroImage =
    getOptimizedWpImageUrl(item.image, 1280, 80) ??
    resolveWpImageUrl(item.image, 1280) ??
    item.image;

  return (
    <SiteShell>
      <div className="custom-page">
        <section className="page-card native-classified-single">
          <div className="page-card__body native-classified-single__body">
            <nav className="native-classified-single__breadcrumbs" aria-label="Breadcrumb">
              <Link href="/">Strona główna</Link>
              <span>/</span>
              <Link href="/ogloszenia/">Ogłoszenia</Link>
              <span>/</span>
              <span>{item.title}</span>
            </nav>

            <div className="native-classified-single__layout">
              <article className="native-classified-single__main">
                <header className="native-classified-single__hero">
                  <div className="native-classified-single__hero-copy">
                    <p className="page-card__eyebrow">Ogłoszenie</p>
                    <h1>{item.title}</h1>
                    <div className="native-classified-single__hero-meta">
                      <span>{formatCurrency(item.price)}</span>
                      {item.location ? <span>{item.location}</span> : null}
                      <span>{item.statusLabel}</span>
                    </div>
                  </div>
                  {heroImage ? (
                    <div className="native-classified-single__hero-media">
                      <img
                        src={heroImage}
                        alt={item.title}
                        loading="eager"
                        decoding="async"
                      />
                    </div>
                  ) : null}
                </header>

                <div className="native-classified-single__content">
                  <section className="native-classified-single__section">
                    <h2>Opis</h2>
                    <p>{item.excerpt}</p>
                  </section>

                  <section className="native-classified-single__section">
                    <h2>Szczegóły ogłoszenia</h2>
                    <div className="native-classified-single__details">
                      <div>
                        <strong>Kategorie</strong>
                        <span>{item.categoryNames.join(", ") || "Bez kategorii"}</span>
                      </div>
                      <div>
                        <strong>Wyświetlenia</strong>
                        <span>{item.viewsCount}</span>
                      </div>
                      {item.author ? (
                        <div>
                          <strong>Autor</strong>
                          <span>{item.author}</span>
                        </div>
                      ) : null}
                    </div>
                  </section>
                </div>
              </article>

              <aside className="native-classified-single__sidebar">
                <section className="native-classified-single__contact">
                  <h2>Kontakt</h2>
                  <div className="native-classified-single__contact-card">
                    {item.phone ? (
                      <a href={`tel:${item.phone.replace(/\s+/g, "")}`}>{item.phone}</a>
                    ) : null}
                    {item.email ? (
                      <a href={`mailto:${item.email}`}>{item.email}</a>
                    ) : (
                      <p>Kontakt przez panel będzie dostępny po pełnym przepięciu kont użytkowników.</p>
                    )}
                  </div>
                </section>

                {sidebarItems.length ? (
                  <section className="native-classified-single__related">
                    <h2>Podobne ogłoszenia</h2>
                    <div className="native-classified-single__related-list">
                      {sidebarItems.map((related) => {
                        const relatedImage =
                          getOptimizedWpImageUrl(related.image, 480) ??
                          resolveWpImageUrl(related.image, 480) ??
                          related.image;

                        return (
                          <Link
                            key={related.path}
                            href={related.path}
                            className="native-classified-single__related-card"
                          >
                            {relatedImage ? (
                              <div className="native-classified-single__related-image">
                                <img
                                  src={relatedImage}
                                  alt={related.title}
                                  loading="lazy"
                                  decoding="async"
                                />
                              </div>
                            ) : null}
                            <div className="native-classified-single__related-copy">
                              <strong>{related.title}</strong>
                              <span>{formatCurrency(related.price)}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </section>
                ) : null}
              </aside>
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
