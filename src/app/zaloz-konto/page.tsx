import type { Metadata } from "next";
import { RegistrationPage } from "@/components/registration-page";

export const metadata: Metadata = {
  title: "Załóż konto",
  description: "Załóż konto na BiomasaPortal i zarządzaj ogłoszeniami z własnego panelu.",
};

export default function SignUpPage() {
  return <RegistrationPage />;
}
