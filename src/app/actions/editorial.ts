"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import {
  publishNextEditorialBatch,
  syncEditorialSeedToSupabase,
} from "@/lib/editorial";

export type EditorialActionState = {
  error?: string;
  success?: string;
};

export async function syncEditorialSeedAction(): Promise<EditorialActionState> {
  await requireAdmin();
  const result = await syncEditorialSeedToSupabase();

  if (!result.ok) {
    return {
      error: result.message,
    };
  }

  revalidatePath("/panel-admina/");
  revalidatePath("/wpisy/");
  revalidatePath("/biomasa-w-polsce/");
  revalidatePath("/page-sitemap.xml");

  return {
    success: result.message,
  };
}

export async function publishNextEditorialBatchAction(
  batchSize = 5,
): Promise<EditorialActionState> {
  await requireAdmin();
  const result = await publishNextEditorialBatch(batchSize);

  if (!result.ok) {
    return {
      error: result.message,
    };
  }

  revalidatePath("/panel-admina/");
  revalidatePath("/wpisy/");
  revalidatePath("/biomasa-w-polsce/");
  revalidatePath("/sitemap.xml");
  revalidatePath("/post-sitemap.xml");
  revalidatePath("/page-sitemap.xml");

  return {
    success: result.message,
  };
}
