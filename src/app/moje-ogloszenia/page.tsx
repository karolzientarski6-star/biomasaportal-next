import type { Metadata } from "next";
import { UserDashboard } from "@/components/user-dashboard";

export const metadata: Metadata = {
  title: "Moje ogłoszenia",
  description: "Panel użytkownika do zarządzania ogłoszeniami na BiomasaPortal.",
};

export default function MyClassifiedsPage() {
  return <UserDashboard />;
}
