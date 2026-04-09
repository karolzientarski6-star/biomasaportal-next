import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MirrorPage } from "@/components/mirror-page";
import { getRouteByPath } from "@/lib/wordpress-export";

type ClassifiedSingleProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ClassifiedSingleProps): Promise<Metadata> {
  const { slug } = await params;
  const route = await getRouteByPath(`/ogloszenia/${slug}/`);

  if (!route) {
    return {};
  }

  return {
    title: route.title,
    description: route.metaDescription,
    alternates: {
      canonical: route.path,
    },
  };
}

export default async function ClassifiedSinglePage({
  params,
}: ClassifiedSingleProps) {
  const { slug } = await params;
  const route = await getRouteByPath(`/ogloszenia/${slug}/`);

  if (!route) {
    notFound();
  }

  return <MirrorPage path={route.path} route={route} />;
}
