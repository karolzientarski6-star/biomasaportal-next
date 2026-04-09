"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const signUpSchema = z
  .object({
    email: z.email("Podaj poprawny adres email."),
    password: z.string().min(8, "Hasło musi mieć minimum 8 znaków."),
    passwordConfirm: z.string().min(8, "Powtórz hasło."),
    terms: z.string().min(1, "Zaakceptuj politykę prywatności i regulamin."),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Hasła muszą być identyczne.",
    path: ["passwordConfirm"],
  });

const signInSchema = z.object({
  email: z.email("Podaj poprawny adres email."),
  password: z.string().min(8, "Hasło musi mieć minimum 8 znaków."),
});

export type AuthActionState = {
  error?: string;
  success?: string;
};

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    passwordConfirm:
      formData.get("passwordConfirm") ?? formData.get("password_confirm"),
    terms: formData.get("terms"),
  });

  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ??
        "Nie udało się przetworzyć formularza.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const origin = formData.get("origin")?.toString() || "http://localhost:3000";

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/moje-ogloszenia/`,
    },
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  revalidatePath("/zaloz-konto/");

  return {
    success:
      "Konto zostało utworzone. Sprawdź skrzynkę mailową i potwierdź adres email.",
  };
}

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ??
        "Nie udało się przetworzyć formularza.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      error: error.message,
    };
  }

  revalidatePath("/");
  redirect("/moje-ogloszenia/");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/");
}
