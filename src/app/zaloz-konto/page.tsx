import type { Metadata } from "next";
import { RegistrationPage } from "@/components/registration-page";
import { getRouteMetadata } from "@/lib/wordpress-export";

export async function generateMetadata(): Promise<Metadata> {
  return getRouteMetadata("/zaloz-konto/");
}

export default async function SignUpPage() {
  return <RegistrationPage />;
}
