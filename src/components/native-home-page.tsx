import Link from "next/link";
import { BlogArchiveGrid } from "@/components/blog-archive-grid";
import { SiteShell } from "@/components/site-shell";
import type { BlogIndexItem } from "@/lib/blog-index";
import type { EditorialCategory } from "@/lib/editorial-categories";
import type { ExportedClassified } from "@/lib/wordpress-export";
import { normalizeWpImageUrl } from "@/lib/html-transform";

type HomeCategorySummary = {
  category: EditorialCategory;
  totalPosts: number;
  latestPosts: BlogIndexItem[];
};

type NativeHomePageProps = {
  latestPosts: BlogIndexItem[];
  categories: HomeCategorySummary[];
  classifieds: ExportedClassified[];
};

function formatCurrency(value?: number | null) {
  if (!value) {
    return "Cena do ustalenia";
  }

  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(value);
}

export function NativeHomePage({
  latestPosts,
  categories,
  classifieds,
}: NativeHomePageProps) {
  const totalPosts = categories.reduce(
    (sum, category) => sum + category.totalPosts,
    0,
  );

  return (
    <SiteShell>
      <div className="home-page">
        <section className="home-hero" data-aos="fade-up">
          <div className="home-hero__copy" data-aos="fade-right" data-aos-delay="40">
            <p className="page-card__eyebrow">BiomasaPortal</p>
            <h1>Rynek biomasy, ogloszenia i tresci SEO w jednym miejscu.</h1>
            <p>
              Budujemy natywny frontend Next.js dla BiomasaPortal bez zaleznosci od
              wordpressowych wrapperow. Tutaj masz wejscie do ogloszen, klastrow
              tresci i najnowszych wpisow o pellecie, biogazie, maszynach lesnych i
              rynku biomasy w Polsce.
            </p>
            <div className="home-hero__actions">
              <Link href="/ogloszenia/" className="site-nav__cta">
                Zobacz ogloszenia
              </Link>
              <Link href="/wpisy/" className="home-hero__secondary">
                Przejdz do wpisow
              </Link>
            </div>
          </div>
          <div className="home-hero__stats" data-aos="fade-left" data-aos-delay="100">
            <div className="home-hero__stat">
              <strong>{categories.length}</strong>
              <span>klastrow tresci</span>
            </div>
            <div className="home-hero__stat">
              <strong>{totalPosts}</strong>
              <span>wpisow w archiwum</span>
            </div>
            <div className="home-hero__stat">
              <strong>{classifieds.length}</strong>
              <span>aktywnych ogloszen</span>
            </div>
          </div>
        </section>

        <section className="home-section" data-aos="fade-up">
          <div className="home-section__header">
            <p className="page-card__eyebrow">Biomasa w Polsce</p>
            <h2>Najwazniejsze klastry tematyczne</h2>
            <p>
              Kazdy klaster ma osobne archiwum, linkowanie wewnetrzne i tresci
              przygotowane pod intencje wyszukiwania.
            </p>
          </div>
          <div className="home-category-grid">
            {categories.map(({ category, totalPosts, latestPosts: posts }, index) => {
              const leadPost = posts[0] ?? null;

              return (
                <article
                  key={category.slug}
                  className="home-category-card"
                  data-aos="fade-up"
                  data-aos-delay={80 + index * 30}
                >
                  <Link href={`/biomasa-w-polsce/${category.slug}/`} className="home-category-card__image">
                    {leadPost?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={normalizeWpImageUrl(leadPost.image) ?? ""}
                        alt={category.name}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span className="home-category-card__fallback">{category.name}</span>
                    )}
                    <span className="home-category-card__badge">
                      {category.accentLabel}
                    </span>
                  </Link>
                  <div className="home-category-card__body">
                    <div className="home-category-card__meta">
                      <span>{totalPosts} wpisow</span>
                      <Link href={`/biomasa-w-polsce/${category.slug}/`}>
                        Zobacz klaster
                      </Link>
                    </div>
                    <h3>
                      <Link href={`/biomasa-w-polsce/${category.slug}/`}>
                        {category.name}
                      </Link>
                    </h3>
                    <p>{category.shortDescription}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="home-section" data-aos="fade-up">
          <div className="home-section__header">
            <p className="page-card__eyebrow">Najnowsze wpisy</p>
            <h2>Aktualne publikacje z rynku biomasy</h2>
            <p>
              Ten grid korzysta juz z natywnych danych i ma ten sam wyglad co na
              stronie glownej, archiwum wpisow i stronach kategorii.
            </p>
          </div>
          <BlogArchiveGrid
            items={latestPosts.slice(0, 6)}
            currentPage={1}
            perPage={6}
            basePath="/wpisy/"
            showSummary={false}
          />
        </section>

        <section className="home-section" data-aos="fade-up">
          <div className="home-section__header">
            <p className="page-card__eyebrow">Ogloszenia</p>
            <h2>Wybrane oferty z rynku biomasy</h2>
            <p>
              Preview ogloszen prowadzi do calego archiwum, ale juz tutaj daje szybki
              wglad w maszyny, surowce i sprzet dostepny w serwisie.
            </p>
          </div>
          <div className="home-classified-grid">
            {classifieds.slice(0, 4).map((item, index) => (
              <Link
                key={item.id}
                href={item.path}
                className="home-classified-card"
                data-aos="fade-up"
                data-aos-delay={90 + index * 35}
              >
                <div className="home-classified-card__image">
                  {normalizeWpImageUrl(item.image) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={normalizeWpImageUrl(item.image)!}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}
                </div>
                <div className="home-classified-card__body">
                  <div className="home-classified-card__pills">
                    {item.featured ? <span>Wyroznione</span> : null}
                    {item.location ? <span>{item.location}</span> : null}
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.excerpt}</p>
                  <div className="home-classified-card__meta">
                    <strong>{formatCurrency(item.price)}</strong>
                    <span>{item.categoryNames.join(", ") || "Bez kategorii"}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
