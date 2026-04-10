import type { Metadata } from "next";
import "aos/dist/aos.css";
import { AnimationProvider } from "@/components/animation-provider";
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
        <AnimationProvider />
        {children}
      </body>
    </html>
  );
}
