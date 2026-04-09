import type { Metadata } from "next";
import { ClassifiedForm } from "@/components/classified-form";

export const metadata: Metadata = {
  title: "Dodaj ogłoszenie",
  description: "Dodaj ogłoszenie biomasy lub maszyn leśnych na BiomasaPortal.",
};

export default function AddClassifiedPage() {
  return <ClassifiedForm />;
}
