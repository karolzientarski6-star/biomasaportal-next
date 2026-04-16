import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditorialArticlePage } from "@/components/editorial-article-page";
import { MirrorPage } from "@/components/mirror-page";
import {
  buildEditorialArticleMetadata,
  getEditorialArticleByPath,
} from "@/lib/editorial";
import { buildRouteMetadata, getRouteByPath } from "@/lib/wordpress-export";

type CatchAllProps = {
  params: Promise<{ slug: string[] }>;
};

function toPath(slug: string[]) {
  return `/${slug.join("/")}/`;
}

export async function generateMetadata({
  params,
}: CatchAllProps): Promise<Metadata> {
  const resolvedParams = await params;
  const path = toPath(resolvedParams.slug);
  const route = await getRouteByPath(path);

  if (route) {
    return buildRouteMetadata(route);
  }

  const editorialArticle = await getEditorialArticleByPath(path);

  if (!editorialArticle || editorialArticle.publicationStatus !== "published") {
    return {};
  }

  return buildEditorialArticleMetadata(editorialArticle);
}

export default async function CatchAllPage({ params }: CatchAllProps) {
  const resolvedParams = await params;
  const path = toPath(resolvedParams.slug);
  const route = await getRouteByPath(path);

  if (route) {
    return <MirrorPage path={path} route={route} />;
  }

  const editorialArticle = await getEditorialArticleByPath(path);

  if (editorialArticle?.publicationStatus === "published") {
    return <EditorialArticlePage path={path} />;
  }

  notFound();
}
