import { BlogArchiveGrid } from "@/components/blog-archive-grid";
import { SiteShell } from "@/components/site-shell";
import type { BlogIndexItem } from "@/lib/blog-index";
import type { EditorialCategory } from "@/lib/editorial-categories";

type ContentArchivePageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  items: BlogIndexItem[];
  currentPage?: number;
  perPage?: number;
  basePath: string;
  category?: EditorialCategory | null;
};

export function ContentArchivePage({
  eyebrow,
  title,
  intro,
  items,
  currentPage = 1,
  perPage = 12,
  basePath,
  category = null,
}: ContentArchivePageProps) {
  return (
    <SiteShell>
      <div className="custom-page">
        <section className="page-card content-archive-page" data-aos="fade-up">
          <div className="page-card__header">
            <p className="page-card__eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p>{intro}</p>
          </div>
          <div className="page-card__body">
            <BlogArchiveGrid
              items={items}
              title={title}
              intro={intro}
              currentPage={currentPage}
              perPage={perPage}
              basePath={basePath}
              category={category}
              showSummary={false}
            />
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
