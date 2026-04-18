import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NativeClassifiedPage } from "@/components/native-classified-page";
import {
  buildRouteMetadata,
  getClassifieds,
  getRouteByPath,
} from "@/lib/wordpress-export";

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
  const [route, classifieds] = await Promise.all([
    getRouteByPath(`/ogloszenia/${slug}/`),
    getClassifieds(),
  ]);
  const item = classifieds.find((entry) => entry.slug === slug) ?? null;

  if (!route || !item) {
    notFound();
  }

  return <NativeClassifiedPage item={item} />;
}
