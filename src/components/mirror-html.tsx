import { transformExportedHtml } from "@/lib/html-transform";

type MirrorHtmlProps = {
  html: string;
};

export function MirrorHtml({ html }: MirrorHtmlProps) {
  return (
    <div
      className="mirror-html"
      dangerouslySetInnerHTML={{ __html: transformExportedHtml(html) }}
    />
  );
}
