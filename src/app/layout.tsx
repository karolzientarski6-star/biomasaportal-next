import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}
