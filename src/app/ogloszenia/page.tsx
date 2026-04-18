import type { Metadata } from "next";
import { ClassifiedArchive } from "@/components/classified-archive";
import { getRouteMetadata } from "@/lib/wordpress-export";

export async function generateMetadata(): Promise<Metadata> {
  return getRouteMetadata("/ogloszenia/");
}

export default function ClassifiedArchivePage() {
  return <ClassifiedArchive />;
}
