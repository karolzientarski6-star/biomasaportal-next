import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentUserContext() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return {
      email: null,
      isAuthenticated: false,
      isAdmin: false,
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email?.toLowerCase() ?? null;
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return {
    email,
    isAuthenticated: Boolean(email),
    isAdmin: email ? (adminEmails.length > 0 ? adminEmails.includes(email) : true) : false,
  };
}

export async function requireAdmin() {
  const context = await getCurrentUserContext();

  if (!context.isAuthenticated) {
    redirect("/zaloguj-sie/");
  }

  if (!context.isAdmin) {
    redirect("/");
  }

  return context;
}
