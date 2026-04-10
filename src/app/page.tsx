import type { Metadata } from "next";
import { MirrorPage } from "@/components/mirror-page";
import { buildRouteMetadata, getRouteByPath } from "@/lib/wordpress-export";

export async function generateMetadata(): Promise<Metadata> {
  const route = await getRouteByPath("/");

  if (!route) {
    return {};
  }

  const metadata = buildRouteMetadata(route);

  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical: "/",
    },
  };
}

export default async function HomePage() {
  return <MirrorPage path="/" />;
}
