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
    title: formData.get("title"),
    category: formData.get("category"),
    description: formData.get("description"),
    price: formData.get("price"),
    location: formData.get("location"),
    phone: formData.get("phone"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Nie udało się zapisać ogłoszenia.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Musisz być zalogowany, żeby dodać ogłoszenie w nowym panelu.",
    };
  }

  const payload = parsed.data;
  const { error } = await supabase.from("classifieds").insert({
    owner_id: user.id,
    title: payload.title,
    slug: `${slugify(payload.title)}-${Date.now()}`,
    description_html: `<p>${payload.description.replace(/\n/g, "<br />")}</p>`,
    location: payload.location || null,
    contact_email: payload.email,
    contact_phone: payload.phone || null,
    price: payload.price ? Number(payload.price.replace(",", ".")) : null,
    moderation_status: "pending",
    publication_mode: "with_account",
    payment_status: "free",
  });

  if (error) {
    return {
      error:
        error.message.includes("relation") || error.message.includes("schema")
          ? "Tabela `classifieds` nie istnieje jeszcze w Supabase. Najpierw odpal schema.sql."
          : error.message,
    };
  }

  revalidatePath("/moje-ogloszenia/");

  return {
    success:
      "Ogłoszenie zapisane jako oczekujące na moderację. Kolejny krok to upload zdjęć i checkout opcji premium.",
  };
}
