import type { Metadata } from "next";
import { SignInPage } from "@/components/sign-in-page";

export const metadata: Metadata = {
  title: "Zaloguj się",
  description: "Zaloguj się do panelu użytkownika BiomasaPortal.",
};

export default async function LoginPage() {
  return <SignInPage />;
}
