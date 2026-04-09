import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://biomasaportal.pl"),
  title: {
    default: "BiomasaPortal",
    template: "%s | BiomasaPortal",
  },
  description: "Portal o polskiej biomasie, ogłoszeniach i rynku maszyn leśnych.",
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
