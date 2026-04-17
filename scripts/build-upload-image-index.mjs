import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const PROJECT_ROOT = process.cwd();
const PUBLIC_UPLOADS_PATH = path.join(
  PROJECT_ROOT,
  "public",
  "wp-content",
  "uploads",
);
const OUTPUT_PATH = path.join(
  PROJECT_ROOT,
  "data",
  "editorial",
  "upload-image-index.json",
);
const IMAGE_EXTENSION_PATTERN = /\.(avif|gif|jpe?g|png|webp)$/i;
const IMAGE_THUMBNAIL_PATTERN = /-\d+x\d+\.(avif|gif|jpe?g|png|webp)$/i;
const MATCH_STOPWORDS = new Set([
  "a",
  "ale",
  "and",
  "co",
  "czy",
  "dla",
  "do",
  "go",
  "i",
  "ile",
  "in",
  "is",
  "jak",
  "jest",
  "na",
  "o",
  "od",
  "or",
  "po",
  "przed",
  "the",
  "to",
  "w",
  "we",
  "with",
  "z",
]);

function normalizeTextForMatch(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokenizeForMatch(value) {
  return Array.from(
    new Set(
      normalizeTextForMatch(value)
        .split(/\s+/)
        .filter(
          (token) =>
            token &&
            (token.length > 2 || /\d/.test(token)) &&
            !MATCH_STOPWORDS.has(token),
        ),
    ),
  );
}

function stripImageDecorators(fileName) {
  return fileName
    .replace(IMAGE_EXTENSION_PATTERN, "")
    .replace(/-\d+x\d+$/i, "");
}

function walkUploadFiles(directoryPath, files = []) {
  for (const entry of readdirSync(directoryPath, { withFileTypes: true })) {
    const absolutePath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      walkUploadFiles(absolutePath, files);
      continue;
    }

    if (!IMAGE_EXTENSION_PATTERN.test(entry.name)) {
      continue;
    }

    if (IMAGE_THUMBNAIL_PATTERN.test(entry.name)) {
      continue;
    }

    files.push(absolutePath);
  }

  return files;
}

const manifest = walkUploadFiles(PUBLIC_UPLOADS_PATH)
  .map((absolutePath) => {
    const relativeUrl = `/${path
      .relative(path.join(PROJECT_ROOT, "public"), absolutePath)
      .replace(/\\/g, "/")}`;
    const normalizedBaseName = normalizeTextForMatch(
      stripImageDecorators(path.basename(absolutePath)),
    );

    return {
      relativeUrl,
      normalizedBaseName,
      tokens: tokenizeForMatch(normalizedBaseName),
      depth: relativeUrl.split("/").length,
    };
  })
  .sort((left, right) => {
    if (left.depth !== right.depth) {
      return left.depth - right.depth;
    }

    return left.relativeUrl.length - right.relativeUrl.length;
  });

mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(OUTPUT_PATH, JSON.stringify(manifest, null, 2));

console.log(`Wrote upload image index with ${manifest.length} entries to ${OUTPUT_PATH}`);
