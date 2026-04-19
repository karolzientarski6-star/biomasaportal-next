import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NativeHtmlPage } from "@/components/native-html-page";
import { buildRouteMetadata, getRouteByPath } from "@/lib/wordpress-export";

export async function generateMetadata(): Promise<Metadata> {
  const route = await getRouteByPath("/polityka-prywatnosci/");
  return route ? buildRouteMetadata(route) : {};
}

export default async function PrivacyPolicyPage() {
  const route = await getRouteByPath("/polityka-prywatnosci/");

  if (!route) {
    notFound();
  }

  return <NativeHtmlPage path="/polityka-prywatnosci/" route={route} />;
}
