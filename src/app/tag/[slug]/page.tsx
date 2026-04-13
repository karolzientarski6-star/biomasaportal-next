import type { Metadata } from "next";
import { notFound } from "next/navigation";

/**
 * Stare tagi WordPress (/tag/{slug}/).
 * Jedyny zaindeksowany tag to "opublikowany-na-fb" — wewnętrzny tag operacyjny.
 * Zwracamy noindex zamiast 404 żeby Google miał czas spokojnie wyindeksować.
 */

type TagPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(_props: TagPageProps): Promise<Metadata> {
  return {
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function WpTagPage({ params }: TagPageProps) {
  await params;
  notFound();
}
