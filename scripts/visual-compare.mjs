import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { load } from "cheerio";

const WORDPRESS_BASE_URL =
  process.env.WORDPRESS_BASE_URL ?? "https://biomasaportal.pl";
const NEXT_BASE_URL =
  process.env.NEXT_COMPARE_BASE_URL ?? "https://biomasaportal-next.vercel.app";

const ROUTES = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [
      "/",
      "/ogloszenia/",
      "/dodaj-ogloszenie/",
      "/moje-ogloszenia/",
      "/zaloz-konto/",
      "/wpisy/",
      "/mapa/",
    ];

const ALL_VIEWPORTS = [
  { name: "desktop", width: 1440, height: 2200, isMobile: false },
  { name: "mobile", width: 390, height: 844, isMobile: true },
];
const VIEWPORT_FILTER = (process.env.COMPARE_VIEWPORTS ?? "desktop,mobile")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const VIEWPORTS = ALL_VIEWPORTS.filter((viewport) =>
  VIEWPORT_FILTER.includes(viewport.name),
);

const HIDE_SELECTORS = [
  "#cookie-notice",
  ".cookie-notice-container",
  ".grecaptcha-badge",
  "iframe[title*='reCAPTCHA']",
];

function normalizeRoute(route) {
  if (!route.startsWith("/")) {
    return `/${route}`;
  }

  return route;
}

function routeSlug(route) {
  if (route === "/") {
    return "home";
  }

  return route
    .replace(/^\/|\/$/g, "")
    .replaceAll("/", "__")
    .replace(/[^\w-]/g, "-");
}

function timestampSlug() {
  return new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
}

async function fetchSeo(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "biomasaportal-visual-compare/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`SEO fetch failed for ${url}: ${response.status}`);
  }

  const html = await response.text();
  const $ = load(html);

  return {
    title: $("title").text().trim(),
    canonical: $("link[rel='canonical']").attr("href")?.trim() ?? "",
    description: $('meta[name="description"]').attr("content")?.trim() ?? "",
  };
}

async function preparePage(page) {
  await page.addStyleTag({
    content: `
      ${HIDE_SELECTORS.join(", ")} {
        display: none !important;
        visibility: hidden !important;
      }
      html {
        scroll-behavior: auto !important;
      }
    `,
  });
}

async function warmUpLazyContent(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      const step = Math.max(Math.floor(window.innerHeight * 0.8), 500);
      const maxScrollTop = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        0,
      );
      let current = 0;

      const timer = setInterval(() => {
        current = Math.min(current + step, maxScrollTop);
        window.scrollTo(0, current);

        if (current >= maxScrollTop) {
          clearInterval(timer);
          resolve();
        }
      }, 150);
    });
  });

  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
}

async function captureScreenshot({
  browser,
  baseUrl,
  route,
  viewport,
  outputPath,
}) {
  const context = await browser.newContext({
    viewport: {
      width: viewport.width,
      height: viewport.height,
    },
    isMobile: viewport.isMobile,
    userAgent: viewport.isMobile
      ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
      : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();
  const url = new URL(route, baseUrl).toString();

  await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
  await preparePage(page);
  await warmUpLazyContent(page);
  await page.screenshot({ path: outputPath, fullPage: true });
  await context.close();
}

async function compareImages(leftPath, rightPath, diffPath) {
  const left = PNG.sync.read(await readFile(leftPath));
  const right = PNG.sync.read(await readFile(rightPath));

  const width = Math.max(left.width, right.width);
  const height = Math.max(left.height, right.height);
  const leftCanvas = new PNG({ width, height });
  const rightCanvas = new PNG({ width, height });

  PNG.bitblt(left, leftCanvas, 0, 0, left.width, left.height, 0, 0);
  PNG.bitblt(right, rightCanvas, 0, 0, right.width, right.height, 0, 0);

  const diff = new PNG({ width, height });
  const mismatchPixels = pixelmatch(
    leftCanvas.data,
    rightCanvas.data,
    diff.data,
    width,
    height,
    {
      threshold: 0.15,
    },
  );

  await writeFile(diffPath, PNG.sync.write(diff));

  return {
    width,
    height,
    mismatchPixels,
    mismatchRatio: Number((mismatchPixels / (width * height)).toFixed(6)),
  };
}

async function main() {
  const artifactDir = path.join(
    process.cwd(),
    "artifacts",
    "visual-compare",
    timestampSlug(),
  );

  await mkdir(artifactDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const summary = [];
  const summaryPath = path.join(artifactDir, "summary.json");

  for (const viewport of VIEWPORTS) {
    for (const routeInput of ROUTES) {
      const route = normalizeRoute(routeInput);
      const slug = routeSlug(route);
      const baseName = `${viewport.name}__${slug}`;
      const wpPath = path.join(artifactDir, `${baseName}__wordpress.png`);
      const nextPath = path.join(artifactDir, `${baseName}__next.png`);
      const diffPath = path.join(artifactDir, `${baseName}__diff.png`);

      console.log(`Comparing ${route} on ${viewport.name}...`);

      const [wpSeo, nextSeo] = await Promise.all([
        fetchSeo(new URL(route, WORDPRESS_BASE_URL).toString()),
        fetchSeo(new URL(route, NEXT_BASE_URL).toString()),
      ]);

      await captureScreenshot({
        browser,
        baseUrl: WORDPRESS_BASE_URL,
        route,
        viewport,
        outputPath: wpPath,
      });

      await captureScreenshot({
        browser,
        baseUrl: NEXT_BASE_URL,
        route,
        viewport,
        outputPath: nextPath,
      });

      const imageDiff = await compareImages(wpPath, nextPath, diffPath);

      summary.push({
        route,
        viewport: viewport.name,
        wordpress: wpSeo,
        next: nextSeo,
        imageDiff,
        files: {
          wordpress: path.relative(process.cwd(), wpPath),
          next: path.relative(process.cwd(), nextPath),
          diff: path.relative(process.cwd(), diffPath),
        },
      });

      await writeFile(summaryPath, JSON.stringify(summary, null, 2), "utf8");
    }
  }

  await browser.close();

  const markdownPath = path.join(artifactDir, "summary.md");

  const markdown = [
    "# Visual Compare Summary",
    "",
    `WordPress: ${WORDPRESS_BASE_URL}`,
    `Next: ${NEXT_BASE_URL}`,
    "",
    ...summary
      .sort((left, right) => right.imageDiff.mismatchRatio - left.imageDiff.mismatchRatio)
      .map((entry) =>
        [
          `## ${entry.route} (${entry.viewport})`,
          "",
          `- mismatch ratio: ${entry.imageDiff.mismatchRatio}`,
          `- mismatch pixels: ${entry.imageDiff.mismatchPixels}`,
          `- title match: ${entry.wordpress.title === entry.next.title ? "yes" : "no"}`,
          `- canonical match: ${entry.wordpress.canonical === entry.next.canonical ? "yes" : "no"}`,
          `- wordpress screenshot: \`${entry.files.wordpress}\``,
          `- next screenshot: \`${entry.files.next}\``,
          `- diff screenshot: \`${entry.files.diff}\``,
          "",
        ].join("\n"),
      ),
  ].join("\n");

  await writeFile(markdownPath, markdown, "utf8");

  console.log(`\nSaved visual comparison to ${artifactDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
