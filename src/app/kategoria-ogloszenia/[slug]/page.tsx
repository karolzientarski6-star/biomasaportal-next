import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClassifiedArchive } from "@/components/classified-archive";
import { buildRouteMetadata, getRouteByPath } from "@/lib/wordpress-export";

type ClassifiedCategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ClassifiedCategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const route = await getRouteByPath(`/kategoria-ogloszenia/${slug}/`);
  return route ? buildRouteMetadata(route) : {};
}

export default async function ClassifiedCategoryPage({
  params,
}: ClassifiedCategoryPageProps) {
  const { slug } = await params;
  const route = await getRouteByPath(`/kategoria-ogloszenia/${slug}/`);

  if (!route) {
    notFound();
  }

  return <ClassifiedArchive currentCategorySlug={slug} />;
}
