import type { Metadata } from "next";
import { MirrorTemplatePage } from "@/components/mirror-template-page";
import { WordPressDashboardSlot } from "@/components/wordpress-dashboard-slot";
import { getRouteMetadata } from "@/lib/wordpress-export";

export async function generateMetadata(): Promise<Metadata> {
  return getRouteMetadata("/moje-ogloszenia/");
}

export default function MyClassifiedsPage() {
  return (
    <MirrorTemplatePage
      path="/moje-ogloszenia/"
      slots={[
        {
          selector: ".elementor-shortcode",
          slotId: "dashboard-slot",
          node: <WordPressDashboardSlot />,
        },
      ]}
    />
  );
}
