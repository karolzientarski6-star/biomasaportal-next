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
};

export function EditorialCategoryHub({
  categories,
}: EditorialCategoryHubProps) {
  return (
    <div className="mirror-html editorial-hub-intro">
      <section className="elementor-element elementor-widget">
        <div className="elementor-widget-container">
          <div className="blog-archive-summary">
            <p className="page-card__eyebrow">Biomasa w Polsce</p>
            <h1>Biomasa w Polsce</h1>
            <p>
              Nowe centrum tresci BiomasaPortal. Kategorie dzialaja jak hub SEO:
              kazda ma wlasny listing, opis ekspercki pod gridem i linkowanie do
              wpisow z tego samego klastra tematycznego.
            </p>
          </div>

          <div className="biomasa-category-grid">
            {categories.map(({ category, totalPosts, latestPosts }) => (
              <article key={category.slug} className="biomasa-category-tile">
                <p className="page-card__eyebrow">{category.accentLabel}</p>
                <h2>
                  <Link href={`/biomasa-w-polsce/${category.slug}/`}>
                    {category.name}
                  </Link>
                </h2>
                <p>{category.shortDescription}</p>
                <div className="biomasa-category-tile__meta">
                  <span>{totalPosts} wpisow</span>
                  <Link href={`/biomasa-w-polsce/${category.slug}/`}>Zobacz kategorie</Link>
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
        </div>
      </section>
    </div>
  );
}
