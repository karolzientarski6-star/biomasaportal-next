import { notFound } from "next/navigation";
import { getRouteByPath, type ExportedRoute } from "@/lib/wordpress-export";
import { MirrorHtml } from "./mirror-html";
import { SiteShell } from "./site-shell";

type MirrorPageProps = {
  path: string;
  route?: ExportedRoute;
  eyebrow?: string;
};

export async function MirrorPage({
  path,
  route: providedRoute,
  eyebrow = "Migracja 1:1",
}: MirrorPageProps) {
  const route = providedRoute ?? (await getRouteByPath(path));

  if (!route) {
    notFound();
  }

  return (
    <SiteShell>
      <article className="mirror-page">
        <section className="page-card">
          <div className="page-card__header">
            <p className="page-card__eyebrow">{eyebrow}</p>
            <h1>{route.title || "BiomasaPortal"}</h1>
            {route.metaDescription ? <p>{route.metaDescription}</p> : null}
          </div>
          <div className="page-card__body">
            <MirrorHtml html={route.html} />
          </div>
        </section>
      </article>
    </SiteShell>
  );
}
