import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NativeHtmlPage } from "@/components/native-html-page";
import { buildRouteMetadata, getRouteByPath } from "@/lib/wordpress-export";

export async function generateMetadata(): Promise<Metadata> {
  const route = await getRouteByPath("/regulamin/");
  return route ? buildRouteMetadata(route) : {};
}

export default async function TermsPage() {
  const route = await getRouteByPath("/regulamin/");

  if (!route) {
    notFound();
  }

  return <NativeHtmlPage path="/regulamin/" route={route} />;
}
