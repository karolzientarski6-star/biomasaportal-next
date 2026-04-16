import type { Metadata } from "next";
import { MirrorPage } from "@/components/mirror-page";
import { getRouteMetadata } from "@/lib/wordpress-export";

export async function generateMetadata(): Promise<Metadata> {
  return getRouteMetadata("/ogloszenia/");
}

export default function ClassifiedArchivePage() {
  return <MirrorPage path="/ogloszenia/" />;
}
