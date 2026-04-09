"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const createClassifiedSchema = z.object({
  title: z.string().min(5, "Tytuł musi mieć co najmniej 5 znaków."),
  category: z.string().min(1, "Wybierz kategorię."),
  description: z.string().min(30, "Opis musi mieć co najmniej 30 znaków."),
  price: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  email: z.email("Podaj poprawny adres email."),
  publicationMode: z.enum(["with_account", "without_account"]).default(
    "with_account",
  ),
  featured: z.boolean().default(false),
});

export type ClassifiedActionState = {
  error?: string;
  success?: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export async function createClassifiedAction(
  _prevState: ClassifiedActionState,
  formData: FormData,
): Promise<ClassifiedActionState> {
  const parsed = createClassifiedSchema.safeParse({
    title: formData.get("title") ?? formData.get("tytul"),
    category: formData.get("category") ?? formData.get("kategoria"),
    description: formData.get("description") ?? formData.get("opis"),
    price: formData.get("price") ?? formData.get("cena"),
    location: formData.get("location") ?? formData.get("lokalizacja"),
    phone: formData.get("phone") ?? formData.get("telefon"),
    email: formData.get("email"),
    publicationMode:
      formData.get("publicationMode") ?? formData.get("account_option"),
    featured: formData.get("featured") === "1",
  });

  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ?? "Nie udało się zapisać ogłoszenia.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Musisz być zalogowany, żeby dodać ogłoszenie.",
    };
  }

  const payload = parsed.data;
  const { data: createdClassified, error } = await supabase
    .from("classifieds")
    .insert({
      owner_id: user.id,
      title: payload.title,
      slug: `${slugify(payload.title)}-${Date.now()}`,
      description_html: `<p>${payload.description.replace(/\n/g, "<br />")}</p>`,
      location: payload.location || null,
      contact_email: payload.email,
      contact_phone: payload.phone || null,
      price: payload.price ? Number(payload.price.replace(",", ".")) : null,
      moderation_status: "pending",
      publication_mode: payload.publicationMode,
      payment_status:
        payload.publicationMode === "with_account" && !payload.featured
          ? "free"
          : "pending",
      featured: payload.featured,
      source: "nextjs",
    })
    .select("id")
    .single();

  if (error || !createdClassified) {
    return {
      error:
        error?.message.includes("relation") || error?.message.includes("schema")
          ? "Tabela `classifieds` nie istnieje jeszcze w Supabase. Najpierw odpal schema.sql."
          : error?.message ?? "Nie udało się zapisać ogłoszenia.",
    };
  }

  const wpTermId = Number(payload.category);

  if (!Number.isNaN(wpTermId)) {
    const { data: category } = await supabase
      .from("classified_categories")
      .select("id")
      .eq("wp_term_id", wpTermId)
      .single();

    if (category) {
      await supabase.from("classified_category_links").insert({
        classified_id: createdClassified.id,
        category_id: category.id,
      });
    }
  }

  revalidatePath("/moje-ogloszenia/");
  revalidatePath("/ogloszenia/");

  return {
    success:
      payload.publicationMode === "with_account" && !payload.featured
        ? "Ogłoszenie zostało zapisane i czeka na moderację."
        : "Ogłoszenie zostało zapisane. W następnym kroku podepniemy płatność Stripe dla tej opcji publikacji.",
  };
}
