import Link from "next/link";
import type { BlogIndexItem } from "@/lib/blog-index";
import type { EditorialCategory } from "@/lib/editorial-categories";

type BlogArchiveGridProps = {
  items: BlogIndexItem[];
  title?: string;
  intro?: string;
  currentPage?: number;
  perPage?: number;
  basePath?: string;
  category?: EditorialCategory | null;
};

const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function paginate<T>(items: T[], currentPage: number, perPage: number) {
  const start = (currentPage - 1) * perPage;
  return items.slice(start, start + perPage);
}

export function BlogArchiveGrid({
  items,
  title = "Wpisy",
  intro,
  currentPage = 1,
  perPage = 12,
  basePath = "/wpisy/",
  category = null,
}: BlogArchiveGridProps) {
  const pageCount = Math.max(1, Math.ceil(items.length / perPage));
  const pagedItems = paginate(items, currentPage, perPage);

  return (
    <div className="mirror-html blog-archive-replacement">
      <section className="elementor-element elementor-widget elementor-widget-posts elementor-has-item-ratio">
        <div className="elementor-widget-container">
          <div className="blog-archive-summary">
            <p className="page-card__eyebrow">{category?.accentLabel ?? "BiomasaPortal"}</p>
            <h1>{title}</h1>
            {intro ? <p>{intro}</p> : null}
          </div>

          {pagedItems.length > 0 ? (
            <div className="elementor-posts-container elementor-posts elementor-posts--skin-cards elementor-grid elementor-has-item-ratio">
              {pagedItems.map((item) => (
                <article
                  key={item.id}
                  className="elementor-post elementor-grid-item post type-post status-publish format-standard has-post-thumbnail hentry category-oze"
                  role="listitem"
                >
                  <div className="elementor-post__card">
                    {item.image ? (
                      <Link
                        className="elementor-post__thumbnail__link"
                        href={item.path}
                        tabIndex={-1}
                      >
                        <div className="elementor-post__thumbnail">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.image}
                            alt={item.title}
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      </Link>
                    ) : null}
                    <div className="elementor-post__text">
                      <h3 className="elementor-post__title">
                        <Link href={item.path}>{item.title}</Link>
                      </h3>
                      <div className="elementor-post__excerpt">
                        <p>{item.excerpt}</p>
                      </div>
                      <div className="elementor-post__read-more-wrapper">
                        <Link
                          className="elementor-post__read-more"
                          href={item.path}
                          aria-label={`Czytaj wiecej o ${item.title}`}
                          tabIndex={-1}
                        >
                          Czytaj wiecej »
                        </Link>
                      </div>
                      <div className="elementor-post__meta-data">
                        <span className="elementor-post-date">
                          {dateFormatter.format(new Date(item.lastModified))}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              W tej sekcji nie ma jeszcze wpisow. Kolejne publikacje pojawia sie
              automatycznie wedlug harmonogramu redakcyjnego.
            </div>
          )}

          {pageCount > 1 ? (
            <nav className="blog-pagination" aria-label="Paginacja wpisow">
              {Array.from({ length: pageCount }, (_, index) => {
                const page = index + 1;
                const href =
                  page === 1
                    ? basePath
                    : `${basePath.replace(/\/$/, "")}/page/${page}/`;

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

          {category ? (
            <div className="blog-category-seo-copy">
              <h2>{category.name} - opis kategorii</h2>
              <p>{category.bodyDescription}</p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
