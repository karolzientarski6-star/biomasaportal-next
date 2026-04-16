import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductArchive } from "@/components/product-archive";
import { getProductIndex } from "@/lib/products";
import { buildRouteMetadata, getRouteByPath } from "@/lib/wordpress-export";

const PRODUCTS_PER_PAGE = 16;

type ShopPaginationProps = {
  params: Promise<{ page: string }>;
};

function parsePageNumber(value: string) {
  const page = Number.parseInt(value, 10);
  return Number.isFinite(page) && page > 0 ? page : null;
}

export async function generateMetadata({
  params,
}: ShopPaginationProps): Promise<Metadata> {
  const { page: pageValue } = await params;
  const page = parsePageNumber(pageValue);

  if (!page) {
    return {};
  }

  const route =
    (await getRouteByPath(`/shop/page/${page}/`)) ??
    (await getRouteByPath("/shop/"));

  if (!route) {
    return {};
  }

  return buildRouteMetadata({
    ...route,
    path: `/shop/page/${page}/`,
    canonicalUrl: `https://biomasaportal.pl/shop/page/${page}/`,
    title: `Sprzedaz maszyn lesnych - strona ${page} | BiomasaPortal`,
  });
}

export default async function ShopPaginationPage({
  params,
}: ShopPaginationProps) {
  const { page: pageValue } = await params;
  const page = parsePageNumber(pageValue);

  if (!page) {
    notFound();
  }

  const items = await getProductIndex();
  const pageCount = Math.max(1, Math.ceil(items.length / PRODUCTS_PER_PAGE));

  if (page > pageCount) {
    notFound();
  }

  return (
    <ProductArchive
      items={items}
      currentPage={page}
      perPage={PRODUCTS_PER_PAGE}
      basePath="/shop/"
    />
  );
}
