import Link from "next/link";
import {
  getClassifiedCategories,
  getClassifieds,
} from "@/lib/wordpress-export";
import { SiteShell } from "./site-shell";

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

export async function ClassifiedArchive() {
  const [items, categories] = await Promise.all([
    getClassifieds(),
    getClassifiedCategories(),
  ]);

  return (
    <SiteShell>
      <div className="custom-page">
        <section className="page-card">
          <div className="page-card__header">
            <p className="page-card__eyebrow">Rynek biomasy</p>
            <h1>Ogłoszenia</h1>
            <p>
              Widok archiwum odwzorowuje obecny dział ogłoszeń i korzysta z
              eksportu WordPressa. Finalnie ten obszar będzie zasilany z
              Supabase, ale już teraz zachowuje te same ścieżki i strukturę SEO.
            </p>
          </div>
          <div className="page-card__body">
            <div className="classifieds-layout">
              <aside className="classifieds-sidebar">
                <h2 className="classified-filters__title">Kategorie</h2>
                <ul className="classified-filters__list">
                  <li>
                    <Link href="/ogloszenia/" className="is-active">
                      <span>Wszystkie</span>
                      <span>{items.length}</span>
                    </Link>
                  </li>
                  {categories.map((category) => (
                    <li key={category.id}>
                      <Link href={`/kategoria-ogloszenia/${category.slug}/`}>
                        <span>{category.name}</span>
                        <span>{category.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </aside>

              <div className="classifieds-main">
                <div className="classified-grid">
                  {items.map((item) => (
                    <Link
                      key={item.id}
                      href={item.path}
                      className="classified-card"
                    >
                      <div className="classified-card__image">
                        {item.image ? <img src={item.image} alt={item.title} /> : null}
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
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
