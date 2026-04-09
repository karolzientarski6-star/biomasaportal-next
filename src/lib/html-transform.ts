const ABSOLUTE_SITE_URL = "https://biomasaportal.pl";

export function transformExportedHtml(html: string) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi, "")
    .replaceAll(ABSOLUTE_SITE_URL, "")
    .replaceAll('src="//', 'src="https://')
    .replaceAll("href=\"//", 'href="https://');
}
