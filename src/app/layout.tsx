import type { Metadata } from "next";
import "aos/dist/aos.css";
import { Suspense } from "react";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { AnimationProvider } from "@/components/animation-provider";
import { PageTransition } from "@/components/page-transition";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://biomasaportal.pl"),
  title: "BiomasaPortal",
  description:
    "BiomasaPortal - źródło informacji o rynku biomasy, ogłoszeniach i maszynach leśnych.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body>
        <Suspense fallback={null}>
          <AnalyticsProvider />
        </Suspense>
        <AnimationProvider />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
