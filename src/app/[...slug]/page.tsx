import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MirrorPage } from "@/components/mirror-page";
import { getRouteByPath } from "@/lib/wordpress-export";

type CatchAllProps = {
  params: Promise<{ slug: string[] }>;
};

function toPath(slug: string[]) {
  return `/${slug.join("/")}/`;
}

export async function generateMetadata({
  params,
}: CatchAllProps): Promise<Metadata> {
  const resolvedParams = await params;
  const route = await getRouteByPath(toPath(resolvedParams.slug));

  if (!route) {
    return {};
  }

  return {
    title: route.title,
    description: route.metaDescription,
    alternates: {
      canonical: route.path,
    },
  };
}

export default async function CatchAllPage({ params }: CatchAllProps) {
  const resolvedParams = await params;
  const path = toPath(resolvedParams.slug);
  const route = await getRouteByPath(path);

  if (!route) {
    notFound();
  }

  return <MirrorPage path={path} route={route} />;
}
