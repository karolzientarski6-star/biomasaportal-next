import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NativeProductPage } from "@/components/native-product-page";
import { buildRouteMetadata, getRouteByPath } from "@/lib/wordpress-export";

type ProductSingleProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductSingleProps): Promise<Metadata> {
  const { slug } = await params;
  const route = await getRouteByPath(`/product/${slug}/`);
  return route ? buildRouteMetadata(route) : {};
}

export default async function ProductSinglePage({ params }: ProductSingleProps) {
  const { slug } = await params;
  const route = await getRouteByPath(`/product/${slug}/`);

  if (!route || !route.bodyClass.includes("single-product")) {
    notFound();
  }

  return <NativeProductPage slug={slug} />;
}
