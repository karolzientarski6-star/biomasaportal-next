import type { Metadata } from "next";
import { NativeHomePage } from "@/components/native-home-page";
import { buildRouteMetadata, getRouteByPath } from "@/lib/wordpress-export";

/**
 * Stara strona WordPress ID=28, slug=biomasa-portal-2.
 * Treść identyczna ze stroną główną — duplikat z historii WP.
 * Canonical wskazuje na "/" żeby Google skonsolidował equity do homepage.
 */
export async function generateMetadata(): Promise<Metadata> {
  const route = await getRouteByPath("/");

  if (!route) {
    return {
      robots: { index: false, follow: false },
    };
  }

  return {
    ...buildRouteMetadata(route),
    alternates: {
      canonical: "/",
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function BiomassPortalLegacyPage() {
  const route = await getRouteByPath("/");

  if (!route) {
    return null;
  }

  return <NativeHomePage route={route} />;
}
