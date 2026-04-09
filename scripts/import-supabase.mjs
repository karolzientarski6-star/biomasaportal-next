import { readFile } from "node:fs/promises";
import path from "node:path";
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const rootDir = process.cwd();
const dataDir = path.join(rootDir, "data", "wordpress");
const { loadEnvConfig } = nextEnv;
loadEnvConfig(rootDir);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

async function readJson(fileName) {
  const raw = await readFile(path.join(dataDir, fileName), "utf8");
  return JSON.parse(raw);
}

async function importCategories() {
  const categories = await readJson("classified-categories.json");
  const rows = categories.map((category) => ({
    wp_term_id: category.id,
    name: category.name,
    slug: category.slug,
  }));

  const { error } = await supabase
    .from("classified_categories")
    .upsert(rows, { onConflict: "wp_term_id" });

  if (error) {
    throw error;
  }

  const { data, error: fetchError } = await supabase
    .from("classified_categories")
    .select("id,wp_term_id");

  if (fetchError) {
    throw fetchError;
  }

  return new Map(data.map((row) => [row.wp_term_id, row.id]));
}

async function importClassifieds(categoryIdMap) {
  const classifieds = await readJson("classifieds.json");

  const rows = classifieds.map((item) => ({
    wp_post_id: item.id,
    title: item.title,
    slug: item.slug || `${slugify(item.title)}-${item.id}`,
    description_html: `<p>${item.excerpt || item.title}</p>`,
    location: item.location,
    contact_email: item.email,
    contact_phone: item.phone,
    price: item.price,
    moderation_status: item.statusLabel?.toLowerCase() === "aktywne" ? "published" : "pending",
    publication_mode: "migration",
    payment_status: "migrated",
    featured: Boolean(item.featured),
    views_count: item.viewsCount ?? 0,
    source: "wordpress-import",
  }));

  const { error } = await supabase
    .from("classifieds")
    .upsert(rows, { onConflict: "wp_post_id" });

  if (error) {
    throw error;
  }

  const { data: inserted, error: insertedError } = await supabase
    .from("classifieds")
    .select("id,wp_post_id");

  if (insertedError) {
    throw insertedError;
  }

  const classifiedIdMap = new Map(inserted.map((row) => [row.wp_post_id, row.id]));

  const links = [];
  for (const item of classifieds) {
    const classifiedId = classifiedIdMap.get(item.id);
    if (!classifiedId) continue;

    for (const categoryName of item.categoryNames ?? []) {
      const categoryId = categoriesByName.get(categoryName);
      if (!categoryId) continue;
      links.push({
        classified_id: classifiedId,
        category_id: categoryId,
      });
    }
  }

  if (links.length > 0) {
    const { error: linksError } = await supabase
      .from("classified_category_links")
      .upsert(links, { onConflict: "classified_id,category_id" });

    if (linksError) {
      throw linksError;
    }
  }
}

const categoriesByName = new Map();

async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Brakuje zmiennych Supabase w środowisku.");
  }

  const categories = await readJson("classified-categories.json");
  categories.forEach((category) => categoriesByName.set(category.name, category.id));

  const categoryIdMap = await importCategories();

  for (const [name, wpTermId] of categoriesByName.entries()) {
    categoriesByName.set(name, categoryIdMap.get(wpTermId));
  }

  await importClassifieds(categoryIdMap);

  console.log("Supabase import completed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
