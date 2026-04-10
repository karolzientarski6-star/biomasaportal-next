import { revalidatePath } from "next/cache";
import { publishScheduledEditorialBatch } from "@/lib/editorial";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return false;
  }

  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const result = await publishScheduledEditorialBatch(5);

  if (result.ok) {
    revalidatePath("/wpisy/");
    revalidatePath("/biomasa-w-polsce/");
    revalidatePath("/post-sitemap.xml");
    revalidatePath("/page-sitemap.xml");
    revalidatePath("/sitemap.xml");
  }

  return Response.json(result, { status: result.ok ? 200 : 500 });
}
