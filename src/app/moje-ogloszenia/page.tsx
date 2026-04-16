import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { WordPressDashboardSlot } from "@/components/wordpress-dashboard-slot";

export const metadata: Metadata = {
  title: "Moje ogłoszenia – BiomasaPortal",
  description: "Panel zarządzania ogłoszeniami użytkownika BiomasaPortal.",
  robots: { index: false, follow: false },
};

export default function MyClassifiedsPage() {
  return (
    <SiteShell>
      <div className="custom-page">
        <section className="page-card">
          <div className="page-card__body">
            <WordPressDashboardSlot />
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
