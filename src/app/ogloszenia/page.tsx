import type { Metadata } from "next";
import { ClassifiedArchive } from "@/components/classified-archive";
import { buildRouteMetadata, getRouteByPath } from "@/lib/wordpress-export";

export async function generateMetadata(): Promise<Metadata> {
  const route = await getRouteByPath("/ogloszenia/");
  return route ? buildRouteMetadata(route) : {};
}

export default function ClassifiedArchivePage() {
  return <ClassifiedArchive />;
}
