import type { Metadata } from "next";
import { ClassifiedArchive } from "@/components/classified-archive";

export const metadata: Metadata = {
  title: "Ogłoszenia",
  description: "Przeglądaj ogłoszenia biomasy, pelletu, PKS i maszyn leśnych.",
};

export default function ClassifiedArchivePage() {
  return <ClassifiedArchive />;
}
