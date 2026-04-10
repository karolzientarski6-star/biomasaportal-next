import Link from "next/link";
import type { BlogIndexItem } from "@/lib/blog-index";
import type { EditorialCategory } from "@/lib/editorial-categories";

type EditorialCategorySummary = {
  category: EditorialCategory;
  totalPosts: number;
  latestPosts: BlogIndexItem[];
};

type EditorialCategoryHubProps = {
  categories: EditorialCategorySummary[];
  latestItems: BlogIndexItem[];
};

const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function EditorialCategoryHub({
  categories,
  latestItems,
}: EditorialCategoryHubProps) {
  return (
    <div className="mirror-html editorial-hub-page">
      <section className="editorial-hub-hero">
        <div className="editorial-hub-hero__copy">
          <p className="page-card__eyebrow">Biomasa w Polsce</p>
          <h1>Biomasa w Polsce</h1>
          <p>
            Centrum tresci BiomasaPortal zbudowane wokol najwazniejszych klastrow
            tematycznych: pelletu, kotlow, biogazu, dotacji, maszyn lesnych i
            rynku biomasy. Kazda sekcja ma wlasny listing, wewnetrzne linkowanie i
            tresci przygotowane pod SEO.
          </p>
        </div>
        <div className="editorial-hub-hero__stats">
          <div className="editorial-hub-stat">
            <strong>{categories.length}</strong>
            <span>klastrow tresci</span>
          </div>
          <div className="editorial-hub-stat">
            <strong>
              {categories.reduce((sum, category) => sum + category.totalPosts, 0)}
            </strong>
            <span>wpisow w hubie</span>
          </div>
          <div className="editorial-hub-stat">
            <strong>SEO</strong>
            <span>linkowanie i archiwa tematyczne</span>
          </div>
        </div>
      </section>

      <section className="editorial-hub-section">
        <div className="editorial-hub-section__header">
          <p className="page-card__eyebrow">Kategorie</p>
          <h2>Przejdz do konkretnego klastra</h2>
        </div>
        <div className="biomasa-category-grid">
          {categories.map(({ category, totalPosts, latestPosts }) => (
            <article key={category.slug} className="biomasa-category-tile">
              <div className="biomasa-category-tile__content">
                <p className="page-card__eyebrow">{category.accentLabel}</p>
                <h3>
                  <Link href={`/biomasa-w-polsce/${category.slug}/`}>
                    {category.name}
                  </Link>
                </h3>
                <p>{category.shortDescription}</p>
              </div>
              <div className="biomasa-category-tile__meta">
                <span>{totalPosts} wpisow</span>
                <Link href={`/biomasa-w-polsce/${category.slug}/`}>
                  Zobacz kategorie
                </Link>
              </div>
              {latestPosts.length > 0 ? (
                <ul className="biomasa-category-tile__links">
                  {latestPosts.slice(0, 2).map((post) => (
                    <li key={post.id}>
                      <Link href={post.path}>{post.title}</Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="editorial-hub-section">
        <div className="editorial-hub-section__header">
          <p className="page-card__eyebrow">Najnowsze publikacje</p>
          <h2>Najswiezsze wpisy z calego rynku biomasy</h2>
        </div>
        <div className="editorial-hub-post-grid">
          {latestItems.slice(0, 6).map((item) => (
            <article key={item.id} className="editorial-hub-post-card">
              {item.image ? (
                <Link href={item.path} className="editorial-hub-post-card__image">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.title} loading="lazy" decoding="async" />
                </Link>
              ) : null}
              <div className="editorial-hub-post-card__body">
                <p className="editorial-hub-post-card__badge">{item.categoryName}</p>
                <h3>
                  <Link href={item.path}>{item.title}</Link>
                </h3>
                <p>{item.excerpt}</p>
                <div className="editorial-hub-post-card__meta">
                  <time dateTime={item.lastModified}>
                    {dateFormatter.format(new Date(item.lastModified))}
                  </time>
                  <Link href={item.path}>Czytaj wiecej</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
