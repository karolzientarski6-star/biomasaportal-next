import type { Metadata } from "next";
import { ClassifiedForm } from "@/components/classified-form";
import { getRouteMetadata } from "@/lib/wordpress-export";

export async function generateMetadata(): Promise<Metadata> {
  return getRouteMetadata("/dodaj-ogloszenie/");
}

export default async function AddClassifiedPage() {
  return <ClassifiedForm />;
}
