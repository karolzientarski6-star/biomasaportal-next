import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClassifiedArchive } from "@/components/classified-archive";
import { getClassifiedCategories, getRouteByPath } from "@/lib/wordpress-export";

type ClassifiedCategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ClassifiedCategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const route = await getRouteByPath(`/kategoria-ogloszenia/${slug}/`);

  if (route) {
    return {
      title: route.title,
      description: route.metaDescription || undefined,
      alternates: {
        canonical: route.canonicalUrl || route.path,
      },
    };
  }

  const categories = await getClassifiedCategories();
  const category = categories.find((entry) => entry.slug === slug);

  if (!category) {
    return {};
  }

  return {
    title: `${category.name} | Ogłoszenia BiomasaPortal`,
    description: `Ogłoszenia w kategorii ${category.name} na BiomasaPortal.`,
    alternates: {
      canonical: `/kategoria-ogloszenia/${slug}/`,
    },
  };
}

export default async function ClassifiedCategoryPage({
  params,
}: ClassifiedCategoryPageProps) {
  const { slug } = await params;
  const categories = await getClassifiedCategories();
  const category = categories.find((entry) => entry.slug === slug);

  if (!category) {
    notFound();
  }

  return <ClassifiedArchive selectedCategorySlug={slug} />;
}
