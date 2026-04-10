import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { injectHtmlSlots, transformExportedHtml } from "@/lib/html-transform";
import { getRouteByPath, type ExportedRoute } from "@/lib/wordpress-export";
import { WordPressBodyClass } from "./wordpress-body-class";
import { WordPressInteractiveEnhancer } from "./wordpress-interactive-enhancer";
import { WordPressAssets } from "./wordpress-assets";
import { WordPressSeoScripts } from "./wordpress-seo-scripts";

type MirrorTemplateSlot = {
  selector: string;
  slotId: string;
  node: React.ReactNode;
};

type MirrorTemplatePageProps = {
  path: string;
  route?: ExportedRoute;
  slots: MirrorTemplateSlot[];
};

function splitHtmlBySlots(html: string, slots: MirrorTemplateSlot[]) {
  const parts: Array<{ type: "html"; content: string } | { type: "slot"; slot: MirrorTemplateSlot }> = [];
  let remaining = html;

  for (const slot of slots) {
    const marker = `<div data-next-slot="${slot.slotId}"></div>`;
    const markerIndex = remaining.indexOf(marker);

    if (markerIndex === -1) {
      continue;
    }

    const before = remaining.slice(0, markerIndex);
    const after = remaining.slice(markerIndex + marker.length);

    if (before) {
      parts.push({ type: "html", content: before });
    }

    parts.push({ type: "slot", slot });
    remaining = after;
  }

  if (remaining) {
    parts.push({ type: "html", content: remaining });
  }

  return parts;
}

export async function MirrorTemplatePage({
  path,
  route: providedRoute,
  slots,
}: MirrorTemplatePageProps) {
  const route = providedRoute ?? (await getRouteByPath(path));

  if (!route) {
    notFound();
  }

  const html = transformExportedHtml(
    injectHtmlSlots(
      route.html,
      slots.map(({ selector, slotId }) => ({ selector, slotId })),
    ),
  );

  const parts = splitHtmlBySlots(html, slots);

  return (
    <>
      <WordPressBodyClass className={route.bodyClass} />
      <WordPressAssets stylesheets={route.stylesheets} />
      <WordPressSeoScripts schemaJsonLd={route.schemaJsonLd} />
      <WordPressInteractiveEnhancer
        path={path}
        featuredImage={route.openGraph.image}
        isSinglePost={route.bodyClass.includes("single-post")}
      />
      <div
        className={`wp-mirror-page${route.bodyClass.includes("single-post") ? " wp-mirror-page--single-post" : ""}`}
        style={
          route.openGraph.image
            ? ({
                ["--wp-featured-image" as string]: `url("${route.openGraph.image}")`,
              } as CSSProperties)
            : undefined
        }
      >
        {parts.map((part, index) =>
          part.type === "html" ? (
            <div
              key={`html-${index}`}
              className="mirror-html"
              dangerouslySetInnerHTML={{ __html: part.content }}
            />
          ) : (
            <div key={`slot-${part.slot.slotId}`} className="mirror-slot-content">
              {part.slot.node}
            </div>
          ),
        )}
      </div>
    </>
  );
}
