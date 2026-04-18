import type { Metadata } from "next";
import { ProductArchive } from "@/components/product-archive";
import { getProductIndex } from "@/lib/products";
import { buildRouteMetadata, getRouteByPath } from "@/lib/wordpress-export";

const PRODUCTS_PER_PAGE = 16;

export async function generateMetadata(): Promise<Metadata> {
  const route = await getRouteByPath("/shop/");
  return route ? buildRouteMetadata(route) : {};
}

export default async function ShopPage() {
  const items = await getProductIndex();

  return (
    <ProductArchive
      items={items}
      currentPage={1}
      perPage={PRODUCTS_PER_PAGE}
      basePath="/shop/"
    />
  );
}
