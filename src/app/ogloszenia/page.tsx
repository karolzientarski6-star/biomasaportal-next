import type { Metadata } from "next";
import { MirrorPage } from "@/components/mirror-page";

export const metadata: Metadata = {
  title: "Ogłoszenia",
  description: "Przeglądaj ogłoszenia biomasy, pelletu, PKS i maszyn leśnych.",
};

export default function ClassifiedArchivePage() {
  return <MirrorPage path="/ogloszenia/" />;
}
