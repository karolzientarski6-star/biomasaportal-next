import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NativeClassifiedPage } from "@/components/native-classified-page";
import { buildRouteMetadata, getRouteByPath } from "@/lib/wordpress-export";

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

  return buildRouteMetadata(route);
}

export default async function ClassifiedSinglePage({
  params,
}: ClassifiedSingleProps) {
  const { slug } = await params;
  const route = await getRouteByPath(`/ogloszenia/${slug}/`);

  if (!route) {
    notFound();
  }

  return <NativeClassifiedPage route={route} slug={slug} />;
}
