"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function approveClassifiedAction(id: string) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  await supabase
    .from("classifieds")
    .update({ moderation_status: "approved" })
    .eq("id", id);
  revalidatePath("/panel-admina/");
}

export async function rejectClassifiedAction(id: string) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  await supabase
    .from("classifieds")
    .update({ moderation_status: "rejected" })
    .eq("id", id);
  revalidatePath("/panel-admina/");
}

export async function deleteClassifiedAction(id: string) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  await supabase.from("classifieds").delete().eq("id", id);
  revalidatePath("/panel-admina/");
}

export async function setPendingClassifiedAction(id: string) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  await supabase
    .from("classifieds")
    .update({ moderation_status: "pending" })
    .eq("id", id);
  revalidatePath("/panel-admina/");
}
