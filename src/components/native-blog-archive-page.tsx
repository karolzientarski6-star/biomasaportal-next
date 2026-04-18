import { NativeBlogSearch } from "@/components/native-blog-search";
import { NativePublicPageFrame } from "@/components/native-public-page-frame";
import { BlogArchiveGrid } from "@/components/blog-archive-grid";
import type { BlogIndexItem } from "@/lib/blog-index";
import type { ElementorWidgetSignature } from "@/lib/elementor-posts-widget";
import type { EditorialCategory } from "@/lib/editorial-categories";
import type { ExportedRoute } from "@/lib/wordpress-export";

type NativeBlogArchivePageProps = {
  path: string;
  route: ExportedRoute;
  title: string;
  intro: string;
  items: BlogIndexItem[];
  currentPage: number;
  perPage: number;
  basePath: string;
  category?: EditorialCategory | null;
  widgetSignature?: ElementorWidgetSignature | null;
};

export function NativeBlogArchivePage({
  path,
  route,
  title,
  intro,
  items,
  currentPage,
  perPage,
  basePath,
  category = null,
  widgetSignature = null,
}: NativeBlogArchivePageProps) {
  return (
    <NativePublicPageFrame path={path} route={route}>
      <div className="editorial-category-page native-blog-archive-page">
        <section className="editorial-category-page__intro native-blog-archive-page__intro">
          <p className="page-card__eyebrow">
            {category?.accentLabel ?? "BiomasaPortal"}
          </p>
          <h1>{title}</h1>
          <p>{intro}</p>
        </section>

        <NativeBlogSearch />

        <BlogArchiveGrid
          items={items}
          title={title}
          intro={intro}
          currentPage={currentPage}
          perPage={perPage}
          basePath={basePath}
          category={category}
          widgetSignature={widgetSignature}
          showSummary={false}
          contained
        />
      </div>
    </NativePublicPageFrame>
  );
}
