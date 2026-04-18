import Link from "next/link";
import {
  getClassifiedCategories,
  getClassifieds,
} from "@/lib/wordpress-export";
import { getOptimizedWpImageUrl, resolveWpImageUrl } from "@/lib/wp-image-variants";
import { SiteShell } from "./site-shell";

type ClassifiedArchiveProps = {
  selectedCategorySlug?: string | null;
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

export async function ClassifiedArchive({
  selectedCategorySlug = null,
}: ClassifiedArchiveProps = {}) {
  const [items, categories] = await Promise.all([
    getClassifieds(),
    getClassifiedCategories(),
  ]);

  const selectedCategory = selectedCategorySlug
    ? categories.find((category) => category.slug === selectedCategorySlug) ?? null
    : null;

  const filteredItems = selectedCategory
    ? items.filter((item) =>
        item.categoryNames.some(
          (name) => name.toLowerCase() === selectedCategory.name.toLowerCase(),
        ),
      )
    : items;

  const title = selectedCategory ? selectedCategory.name : "Ogłoszenia";
  const intro = selectedCategory
    ? `Aktualne ogłoszenia w kategorii ${selectedCategory.name}. Front tej sekcji działa już w natywnym buildzie Next.js, przy zachowaniu tych samych adresów i SEO.`
    : "Aktualne ogłoszenia rynku biomasy, pelletu i maszyn leśnych. Ta sekcja działa już w natywnym buildzie Next.js, przy zachowaniu tych samych adresów i SEO.";

  return (
    <SiteShell>
      <div className="custom-page">
        <section className="page-card">
          <div className="page-card__header">
            <p className="page-card__eyebrow">Rynek biomasy</p>
            <h1>{title}</h1>
            <p>{intro}</p>
          </div>
          <div className="page-card__body">
            <div className="classifieds-layout">
              <aside className="classifieds-sidebar">
                <h2 className="classified-filters__title">Kategorie</h2>
                <ul className="classified-filters__list">
                  <li>
                    <Link
                      href="/ogloszenia/"
                      className={!selectedCategory ? "is-active" : undefined}
                    >
                      <span>Wszystkie</span>
                      <span>{items.length}</span>
                    </Link>
                  </li>
                  {categories.map((category) => (
                    <li key={category.id}>
                      <Link
                        href={`/kategoria-ogloszenia/${category.slug}/`}
                        className={
                          selectedCategory?.slug === category.slug ? "is-active" : undefined
                        }
                      >
                        <span>{category.name}</span>
                        <span>{category.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </aside>

              <div className="classifieds-main">
                <div className="classified-grid">
                  {filteredItems.map((item) => {
                    const image =
                      getOptimizedWpImageUrl(item.image, 640) ??
                      resolveWpImageUrl(item.image, 640) ??
                      item.image;

                    return (
                      <Link
                        key={item.id}
                        href={item.path}
                        className="classified-card"
                      >
                        <div className="classified-card__image">
                          {image ? (
                            <img
                              src={image}
                              alt={item.title}
                              loading="lazy"
                              decoding="async"
                            />
                          ) : null}
                        </div>
                        <div className="classified-card__content">
                          <div className="button-row">
                            {item.featured ? (
                              <span className="pill">Wyróżnione</span>
                            ) : null}
                            {item.location ? (
                              <span className="pill">{item.location}</span>
                            ) : null}
                          </div>
                          <h2>{item.title}</h2>
                          <p>{item.excerpt}</p>
                          <div className="classified-card__meta">
                            <span>{formatCurrency(item.price)}</span>
                            <span>{item.categoryNames.join(", ") || "Bez kategorii"}</span>
                            <span>{item.viewsCount} wyświetleń</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {filteredItems.length === 0 ? (
                  <div className="empty-state">Brak ogłoszeń w tej kategorii.</div>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
