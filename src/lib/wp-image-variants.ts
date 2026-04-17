import { readFileSync } from "node:fs";
import path from "node:path";

const ABSOLUTE_SITE_URL = "https://biomasaportal.pl";
const NEXT_IMAGE_WIDTHS = [
  16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840,
];
const UPLOAD_IMAGE_INDEX_PATH = path.join(
  process.cwd(),
  "data",
  "editorial",
  "upload-image-index.json",
);

type UploadImageManifestEntry = {
  relativeUrl: string;
  normalizedBaseName: string;
  tokens: string[];
  depth: number;
};

type UploadImageVariant = UploadImageManifestEntry & {
  directory: string;
  width: number | null;
  height: number | null;
};

let uploadVariantsCache: UploadImageVariant[] | null = null;

function toRelativeUploadUrl(url: string | null | undefined) {
  if (!url) {
    return null;
  }

  const normalized = url.trim();

  if (normalized.startsWith("/wp-content/")) {
    return normalized.split("?")[0] ?? normalized;
  }

  if (normalized.startsWith(`${ABSOLUTE_SITE_URL}/wp-content/`)) {
    return normalized.slice(ABSOLUTE_SITE_URL.length).split("?")[0] ?? normalized;
  }

  try {
    const parsed = new URL(normalized);
    if (parsed.pathname.startsWith("/wp-content/")) {
      return parsed.pathname;
    }
  } catch {
    return null;
  }

  return null;
}

function parseVariantDimensions(relativeUrl: string) {
  const match = path
    .basename(relativeUrl)
    .match(/-(\d+)x(\d+)(?=\.(avif|gif|jpe?g|png|webp)$)/i);

  if (!match) {
    return { width: null, height: null };
  }

  return {
    width: Number.parseInt(match[1] ?? "", 10) || null,
    height: Number.parseInt(match[2] ?? "", 10) || null,
  };
}

function getUploadVariants() {
  if (uploadVariantsCache) {
    return uploadVariantsCache;
  }

  try {
    const raw = readFileSync(UPLOAD_IMAGE_INDEX_PATH, "utf8");
    const manifest = JSON.parse(raw) as UploadImageManifestEntry[];

    uploadVariantsCache = manifest.map((entry) => {
      const { width, height } = parseVariantDimensions(entry.relativeUrl);

      return {
        ...entry,
        directory: path.posix.dirname(entry.relativeUrl),
        width,
        height,
      };
    });
  } catch {
    uploadVariantsCache = [];
  }

  return uploadVariantsCache;
}

function chooseBestVariant(
  variants: UploadImageVariant[],
  preferredWidth: number,
) {
  const sizedVariants = variants
    .filter((entry) => entry.width)
    .sort((left, right) => (left.width ?? 0) - (right.width ?? 0));

  if (sizedVariants.length === 0) {
    return null;
  }

  const candidate =
    sizedVariants.find((entry) => (entry.width ?? 0) >= preferredWidth) ??
    sizedVariants[sizedVariants.length - 1] ??
    null;

  return candidate;
}

export function resolveWpImageUrl(
  url: string | null | undefined,
  preferredWidth?: number | null,
) {
  if (!url) {
    return null;
  }

  const relativeUrl = toRelativeUploadUrl(url);
  if (!relativeUrl) {
    return url;
  }

  if (!preferredWidth || preferredWidth <= 0) {
    return relativeUrl;
  }

  const baseDirectory = path.posix.dirname(relativeUrl);
  const fileName = path.posix.basename(relativeUrl);
  const extension = path.posix.extname(fileName);
  const baseName = fileName
    .replace(extension, "")
    .replace(/-\d+x\d+$/i, "")
    .toLowerCase();

  const variants = getUploadVariants().filter((entry) => {
    const entryFileName = path.posix.basename(entry.relativeUrl);
    const entryExtension = path.posix.extname(entryFileName);
    const entryBaseName = entryFileName
      .replace(entryExtension, "")
      .replace(/-\d+x\d+$/i, "")
      .toLowerCase();

    return entry.directory === baseDirectory && entryBaseName === baseName;
  });

  if (variants.length === 0) {
    return relativeUrl;
  }

  const preferredVariant = chooseBestVariant(variants, preferredWidth);
  return preferredVariant?.relativeUrl ?? relativeUrl;
}

function getNextImageWidth(preferredWidth: number) {
  return (
    NEXT_IMAGE_WIDTHS.find((width) => width >= preferredWidth) ??
    NEXT_IMAGE_WIDTHS[NEXT_IMAGE_WIDTHS.length - 1] ??
    preferredWidth
  );
}

export function getOptimizedWpImageUrl(
  url: string | null | undefined,
  preferredWidth?: number | null,
  quality = 75,
) {
  const resolvedUrl = resolveWpImageUrl(url, preferredWidth);

  if (!resolvedUrl || !resolvedUrl.startsWith("/wp-content/")) {
    return resolvedUrl;
  }

  if (!preferredWidth || preferredWidth <= 0) {
    return resolvedUrl;
  }

  const width = getNextImageWidth(preferredWidth);
  return `/_next/image?url=${encodeURIComponent(resolvedUrl)}&w=${width}&q=${quality}`;
}
