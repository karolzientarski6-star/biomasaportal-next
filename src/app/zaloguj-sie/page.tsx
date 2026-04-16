import type { Metadata } from "next";
import { SignInPage } from "@/components/sign-in-page";

export const metadata: Metadata = {
  title: "Zaloguj sie",
  description: "Zaloguj sie do panelu uzytkownika BiomasaPortal.",
};

export default async function LoginPage() {
  return <SignInPage />;
}
