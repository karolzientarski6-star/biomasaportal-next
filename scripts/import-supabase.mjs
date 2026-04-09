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

async function ensureAuthUsers() {
  const wpUsers = await readJson("wp-users.json");
  const authIdByWpId = new Map();

  const { data: listedUsers, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (listError) {
    throw listError;
  }

  const existingByEmail = new Map(
    (listedUsers.users ?? [])
      .filter((user) => user.email)
      .map((user) => [user.email.toLowerCase(), user]),
  );

  for (const wpUser of wpUsers) {
    const email = String(wpUser.user_email).toLowerCase();
    let authUser = existingByEmail.get(email);

    if (!authUser) {
      const { data: created, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: `Migracja!${wpUser.ID}${Math.random().toString(36).slice(2, 10)}`,
        email_confirm: true,
        user_metadata: {
          display_name: wpUser.display_name,
          wp_user_id: Number(wpUser.ID),
          wp_login: wpUser.user_login,
          wp_roles: wpUser.roles,
        },
      });

      if (createError) {
        throw createError;
      }

      authUser = created.user;
      existingByEmail.set(email, authUser);
    }

    authIdByWpId.set(Number(wpUser.ID), authUser.id);
  }

  const profileRows = wpUsers
    .map((wpUser) => {
      const authId = authIdByWpId.get(Number(wpUser.ID));
      if (!authId) return null;
      return {
        id: authId,
        email: String(wpUser.user_email).toLowerCase(),
        display_name: wpUser.display_name || wpUser.user_login,
      };
    })
    .filter(Boolean);

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(profileRows, { onConflict: "id" });

  if (profileError) {
    throw profileError;
  }

  return authIdByWpId;
}

async function importClassifieds(categoryIdMap, authIdByWpId) {
  const classifieds = await readJson("classifieds.json");

  const rows = classifieds.map((item) => ({
    wp_post_id: item.id,
    owner_id: authIdByWpId.get(Number(String(item.author || "").replace("user-", ""))) ?? null,
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
  const authIdByWpId = await ensureAuthUsers();

  for (const [name, wpTermId] of categoriesByName.entries()) {
    categoriesByName.set(name, categoryIdMap.get(wpTermId));
  }

  await importClassifieds(categoryIdMap, authIdByWpId);

  console.log("Supabase import completed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
