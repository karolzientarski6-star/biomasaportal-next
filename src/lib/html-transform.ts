const ABSOLUTE_SITE_URL = "https://biomasaportal.pl";

export function transformExportedHtml(html: string) {
  return html
    .replaceAll(ABSOLUTE_SITE_URL, "")
    .replaceAll('src="//', 'src="https://')
    .replaceAll("href=\"//", 'href="https://');
}
