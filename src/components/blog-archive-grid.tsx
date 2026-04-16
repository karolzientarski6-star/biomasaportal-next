import Link from "next/link";
import type { BlogIndexItem } from "@/lib/blog-index";
import type { ElementorWidgetSignature } from "@/lib/elementor-posts-widget";
import type { EditorialCategory } from "@/lib/editorial-categories";
import { normalizeWpImageUrl } from "@/lib/html-transform";

type BlogArchiveGridProps = {
  items: BlogIndexItem[];
  title?: string;
  intro?: string;
  currentPage?: number;
  perPage?: number;
  basePath?: string;
  category?: EditorialCategory | null;
  widgetSignature?: ElementorWidgetSignature | null;
  showSummary?: boolean;
  contained?: boolean;
};

const dayMonthFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "long",
});

const yearFormatter = new Intl.DateTimeFormat("pl-PL", {
  year: "numeric",
});

function formatWpDate(value: string) {
  const date = new Date(value);
  return `${dayMonthFormatter.format(date)}, ${yearFormatter.format(date)}`;
}

function paginate<T>(items: T[], currentPage: number, perPage: number) {
  const start = (currentPage - 1) * perPage;
  return items.slice(start, start + perPage);
}

function toReactAttributes(attributes?: Record<string, string>) {
  if (!attributes) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(attributes).map(([key, value]) => [
      key === "class" ? "className" : key,
      value,
    ]),
  );
}

function joinClassNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function BlogArchiveGrid({
  items,
  title = "Wpisy",
  intro,
  currentPage = 1,
  perPage = 12,
  basePath = "/wpisy/",
  category = null,
  widgetSignature = null,
  showSummary = true,
  contained = false,
}: BlogArchiveGridProps) {
  const pageCount = Math.max(1, Math.ceil(items.length / perPage));
  const pagedItems = paginate(items, currentPage, perPage);
  const widgetProps = toReactAttributes(widgetSignature?.attributes);
  const widgetContainerProps = toReactAttributes(
    widgetSignature?.widgetContainerAttributes,
  );
  const postsContainerProps = toReactAttributes(
    widgetSignature?.postsContainerAttributes,
  );
  const articleProps = toReactAttributes(widgetSignature?.articleAttributes);
  const cardProps = toReactAttributes(widgetSignature?.cardAttributes);
  const thumbnailLinkProps = toReactAttributes(
    widgetSignature?.thumbnailLinkAttributes,
  );
  const thumbnailProps = toReactAttributes(widgetSignature?.thumbnailAttributes);
  const badgeProps = toReactAttributes(widgetSignature?.badgeAttributes);
  const textProps = toReactAttributes(widgetSignature?.textAttributes);
  const titleProps = toReactAttributes(widgetSignature?.titleAttributes);
  const excerptProps = toReactAttributes(widgetSignature?.excerptAttributes);
  const readMoreProps = toReactAttributes(widgetSignature?.readMoreAttributes);
  const metaProps = toReactAttributes(widgetSignature?.metaAttributes);
  const dateProps = toReactAttributes(widgetSignature?.dateAttributes);

  return (
    <div
      {...widgetProps}
      className={joinClassNames(
        "blog-archive-grid-root",
        contained ? "blog-archive-grid-root--contained" : undefined,
        (widgetProps.className as string | undefined) ??
          "elementor-element elementor-widget elementor-widget-posts",
      )}
    >
      <div
        {...widgetContainerProps}
        className={
          (widgetContainerProps.className as string | undefined) ??
          "elementor-widget-container"
        }
      >
        {showSummary ? (
          <div className="blog-archive-summary">
            <p className="page-card__eyebrow">
              {category?.accentLabel ?? "BiomasaPortal"}
            </p>
            <h1>{title}</h1>
            {intro ? <p>{intro}</p> : null}
          </div>
        ) : null}

        {pagedItems.length > 0 ? (
          <div
            {...postsContainerProps}
            className={
              (postsContainerProps.className as string | undefined) ??
              "elementor-posts-container elementor-posts elementor-posts--skin-cards elementor-grid"
            }
          >
            {pagedItems.map((item) => (
              <article
                key={item.id}
                {...articleProps}
                className={
                  (articleProps.className as string | undefined) ??
                  "elementor-post elementor-grid-item post type-post status-publish format-standard has-post-thumbnail hentry"
                }
                role="listitem"
              >
                <div
                  {...cardProps}
                  className={
                    (cardProps.className as string | undefined) ?? "elementor-post__card"
                  }
                >
                  {normalizeWpImageUrl(item.image) ? (
                    <Link
                      {...thumbnailLinkProps}
                      className={
                        (thumbnailLinkProps.className as string | undefined) ??
                        "elementor-post__thumbnail__link"
                      }
                      href={item.path}
                      tabIndex={-1}
                    >
                      <div
                        {...thumbnailProps}
                        className={
                          (thumbnailProps.className as string | undefined) ??
                          "elementor-post__thumbnail"
                        }
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={normalizeWpImageUrl(item.image) ?? ""}
                          alt={item.title}
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    </Link>
                  ) : null}
                  <div
                    {...badgeProps}
                    className={
                      (badgeProps.className as string | undefined) ??
                      "elementor-post__badge"
                    }
                  >
                    {item.categoryName}
                  </div>
                  <div
                    {...textProps}
                    className={
                      (textProps.className as string | undefined) ?? "elementor-post__text"
                    }
                  >
                    <h3
                      {...titleProps}
                      className={
                        (titleProps.className as string | undefined) ??
                        "elementor-post__title"
                      }
                    >
                      <Link href={item.path}>{item.title}</Link>
                    </h3>
                    <div
                      {...excerptProps}
                      className={
                        (excerptProps.className as string | undefined) ??
                        "elementor-post__excerpt"
                      }
                    >
                      <p>{item.excerpt}</p>
                    </div>
                    <Link
                      {...readMoreProps}
                      className={
                        (readMoreProps.className as string | undefined) ??
                        "elementor-post__read-more"
                      }
                      href={item.path}
                      aria-label={`Czytaj więcej o ${item.title}`}
                      tabIndex={-1}
                    >
                      Czytaj więcej &gt;
                    </Link>
                  </div>
                  {/* meta-data is a sibling of elementor-post__text in WP, NOT nested inside it */}
                  <div
                    {...metaProps}
                    className={
                      (metaProps.className as string | undefined) ??
                      "elementor-post__meta-data"
                    }
                  >
                    <span
                      {...dateProps}
                      className={
                        (dateProps.className as string | undefined) ??
                        "elementor-post-date"
                      }
                    >
                      {formatWpDate(item.lastModified)}
                    </span>
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
    </div>
  );
}
