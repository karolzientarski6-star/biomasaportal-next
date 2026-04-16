import Link from "next/link";
import type { ProductIndexItem } from "@/lib/products";
import { SiteShell } from "@/components/site-shell";

type ProductArchiveProps = {
  items: ProductIndexItem[];
  currentPage: number;
  perPage: number;
  basePath: string;
};

function paginate<T>(items: T[], currentPage: number, perPage: number) {
  const start = (currentPage - 1) * perPage;
  return items.slice(start, start + perPage);
}

export function ProductArchive({
  items,
  currentPage,
  perPage,
  basePath,
}: ProductArchiveProps) {
  const pagedItems = paginate(items, currentPage, perPage);
  const pageCount = Math.max(1, Math.ceil(items.length / perPage));

  return (
    <SiteShell>
      <div className="custom-page">
        <section className="page-card">
          <div className="page-card__header">
            <p className="page-card__eyebrow">Maszyny lesne</p>
            <h1>Sprzedaz maszyn lesnych</h1>
            <p>
              Natywne archiwum ofert sprzetu lesnego i maszyn do biomasy. Zachowuje
              obecne URL-e, SEO i porzadek ofert ze starego WooCommerce, ale dziala
              juz bez wordpressowego frontendu.
            </p>
          </div>
          <div className="page-card__body">
            <div className="product-archive-topline">
              <span>
                Wyswietlanie {(currentPage - 1) * perPage + 1}-
                {Math.min(currentPage * perPage, items.length)} z {items.length} wynikow
              </span>
            </div>

            <div className="product-grid">
              {pagedItems.map((item) => (
                <Link key={item.path} href={item.path} className="product-card">
                  <div className="product-card__image">
                    {item.image ? (
                      <img src={item.image} alt={item.title} loading="lazy" decoding="async" />
                    ) : null}
                  </div>
                  <div className="product-card__body">
                    {item.categoryName ? (
                      <p className="product-card__badge">{item.categoryName}</p>
                    ) : null}
                    <h2>{item.title}</h2>
                    <p>{item.excerpt}</p>
                    <span className="product-card__cta">Dowiedz sie wiecej</span>
                  </div>
                </Link>
              ))}
            </div>

            {pageCount > 1 ? (
              <nav className="blog-pagination" aria-label="Paginacja oferty">
                {Array.from({ length: pageCount }, (_, index) => {
                  const page = index + 1;
                  const href =
                    page === 1 ? basePath : `${basePath.replace(/\/$/, "")}/page/${page}/`;

                  return (
                    <Link
                      key={href}
                      href={href}
                      className={page === currentPage ? "is-active" : undefined}
                    >
                      {page}
                    </Link>
                  );
                })}
              </nav>
            ) : null}
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
