import Link from "next/link";
import {
  getClassifiedCategories,
  getClassifieds,
  type ExportedClassified,
  type ExportedClassifiedCategory,
} from "@/lib/wordpress-export";
import { normalizeWpImageUrl } from "@/lib/html-transform";
import { SiteShell } from "./site-shell";

type ClassifiedArchiveProps = {
  currentCategorySlug?: string | null;
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

function buildCategoryMap(categories: ExportedClassifiedCategory[]) {
  return new Map(categories.map((category) => [category.id, category]));
}

function collectDescendantSlugs(
  category: ExportedClassifiedCategory,
  allCategories: ExportedClassifiedCategory[],
) {
  const descendants = new Set<string>([category.slug]);
  const queue = [category.id];

  while (queue.length > 0) {
    const parentId = queue.shift()!;

    for (const child of allCategories.filter((item) => item.parent === parentId)) {
      descendants.add(child.slug);
      queue.push(child.id);
    }
  }

  return descendants;
}

function getCategorySlugsForItem(
  item: ExportedClassified,
  categoryMap: Map<number, ExportedClassifiedCategory>,
  allCategories: ExportedClassifiedCategory[],
) {
  const directCategories = allCategories.filter((category) =>
    item.categoryNames.includes(category.name),
  );
  const allSlugs = new Set<string>();

  for (const category of directCategories) {
    allSlugs.add(category.slug);

    let parent = categoryMap.get(category.parent);
    while (parent) {
      allSlugs.add(parent.slug);
      parent = categoryMap.get(parent.parent);
    }
  }

  return allSlugs;
}

export async function ClassifiedArchive({
  currentCategorySlug = null,
}: ClassifiedArchiveProps) {
  const [items, categories] = await Promise.all([
    getClassifieds(),
    getClassifiedCategories(),
  ]);

  const categoryMap = buildCategoryMap(categories);
  const currentCategory =
    categories.find((category) => category.slug === currentCategorySlug) ?? null;
  const visibleSlugs = currentCategory
    ? collectDescendantSlugs(currentCategory, categories)
    : null;
  const filteredItems = currentCategory
    ? items.filter((item) => {
        const itemSlugs = getCategorySlugsForItem(item, categoryMap, categories);
        return [...itemSlugs].some((slug) => visibleSlugs?.has(slug));
      })
    : items;

  return (
    <SiteShell>
      <div className="custom-page">
        <section className="page-card">
          <div className="page-card__header">
            <p className="page-card__eyebrow">Rynek biomasy</p>
            <h1>{currentCategory ? currentCategory.name : "Ogloszenia"}</h1>
            <p>
              {currentCategory
                ? `Archiwum ogloszen w kategorii ${currentCategory.name}. Frontend dziala juz natywnie w Next.js, ale zachowuje dotychczasowe URL-e i SEO.`
                : "Archiwum ogloszen BiomasaPortal z zachowaniem URL-i, struktury SEO i natywnego frontendu Next.js."}
            </p>
          </div>
          <div className="page-card__body">
            <div className="classifieds-layout">
              <aside className="classifieds-sidebar">
                <h2 className="classified-filters__title">Kategorie</h2>
                <ul className="classified-filters__list">
                  <li>
                    <Link
                      href="/ogloszenia/"
                      className={currentCategory ? undefined : "is-active"}
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
                          category.slug === currentCategorySlug ? "is-active" : undefined
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
                  {filteredItems.map((item) => (
                    <Link key={item.id} href={item.path} className="classified-card">
                      <div className="classified-card__image">
                        {normalizeWpImageUrl(item.image) ? (
                          <img
                            src={normalizeWpImageUrl(item.image)!}
                            alt={item.title}
                            loading="lazy"
                            decoding="async"
                          />
                        ) : null}
                      </div>
                      <div className="classified-card__content">
                        <div className="button-row">
                          {item.featured ? <span className="pill">Wyroznione</span> : null}
                          {item.location ? <span className="pill">{item.location}</span> : null}
                        </div>
                        <h2>{item.title}</h2>
                        <p>{item.excerpt}</p>
                        <div className="classified-card__meta">
                          <span>{formatCurrency(item.price)}</span>
                          <span>{item.categoryNames.join(", ") || "Bez kategorii"}</span>
                          <span>{item.viewsCount} wyswietlen</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {filteredItems.length === 0 ? (
                  <div className="empty-state">
                    W tej kategorii nie ma jeszcze aktywnych ogloszen.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
