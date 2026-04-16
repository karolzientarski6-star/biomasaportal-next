import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  approveClassifiedAction,
  rejectClassifiedAction,
  deleteClassifiedAction,
} from "@/app/actions/classifieds-admin";

type StatusFilter = "all" | "pending" | "approved" | "rejected" | "published";

async function getClassifieds(status: StatusFilter) {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("classifieds")
    .select("id,title,slug,moderation_status,owner_id,created_at,views_count")
    .order("created_at", { ascending: false });

  if (status !== "all") {
    query = query.eq("moderation_status", status);
  }

  const { data } = await query;
  return data ?? [];
}

async function getUserEmails(ownerIds: string[]): Promise<Record<string, string>> {
  if (!ownerIds.length) return {};
  const supabase = createSupabaseAdminClient();
  const map: Record<string, string> = {};
  // Fetch in batches of 10
  for (let i = 0; i < ownerIds.length; i += 10) {
    const batch = ownerIds.slice(i, i + 10);
    for (const uid of batch) {
      if (map[uid]) continue;
      const { data } = await supabase.auth.admin.getUserById(uid);
      if (data?.user?.email) map[uid] = data.user.email;
    }
  }
  return map;
}

const STATUS_LABELS: Record<string, string> = {
  approved: "Aktywne",
  published: "Opublikowane",
  pending: "Oczekuje",
  rejected: "Odrzucone",
};

export async function AdminClassifieds({ filter = "all" }: { filter?: StatusFilter }) {
  const items = await getClassifieds(filter);
  const uniqueOwners = [...new Set(items.map((i) => i.owner_id).filter(Boolean))];
  const emailMap = await getUserEmails(uniqueOwners as string[]);

  const counts = {
    all: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    published: 0,
  };
  // Get counts
  const supabase = createSupabaseAdminClient();
  const { data: all } = await supabase.from("classifieds").select("moderation_status");
  (all ?? []).forEach((r) => {
    counts.all++;
    const s = r.moderation_status as StatusFilter;
    if (s in counts) counts[s]++;
  });

  return (
    <div className="admin-classifieds">
      {/* Filter tabs */}
      <div className="admin-tabs">
        {(["all", "pending", "approved", "published", "rejected"] as StatusFilter[]).map((s) => (
          <Link
            key={s}
            href={s === "all" ? "/panel-admina/" : `/panel-admina/?status=${s}`}
            className={`admin-tab${filter === s ? " admin-tab--active" : ""}`}
          >
            {s === "all" ? "Wszystkie" : STATUS_LABELS[s] ?? s}
            <span className="admin-tab__count">{counts[s]}</span>
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <p style={{ color: "var(--muted)", padding: "16px 0" }}>
          Brak ogłoszeń w tej kategorii.
        </p>
      ) : (
        <div className="admin-listings">
          {items.map((item) => (
            <div key={item.id} className="admin-listing-row">
              <div className="admin-listing-row__info">
                <span className={`status-pill status-pill--${item.moderation_status}`}>
                  {STATUS_LABELS[item.moderation_status] ?? item.moderation_status}
                </span>
                <div className="admin-listing-row__title">
                  {item.slug ? (
                    <Link href={`/ogloszenia/${item.slug}/`} target="_blank">
                      {item.title}
                    </Link>
                  ) : (
                    item.title
                  )}
                </div>
                <div className="admin-listing-row__meta">
                  <span>{emailMap[item.owner_id ?? ""] ?? item.owner_id?.slice(0, 8)}</span>
                  <span>·</span>
                  <span>{new Date(item.created_at).toLocaleDateString("pl-PL")}</span>
                  <span>·</span>
                  <span>{item.views_count ?? 0} wyśw.</span>
                </div>
              </div>

              <div className="admin-listing-row__actions">
                {item.moderation_status !== "approved" && item.moderation_status !== "published" && (
                  <form action={approveClassifiedAction.bind(null, item.id)}>
                    <button type="submit" className="admin-btn admin-btn--approve">
                      Zatwierdź
                    </button>
                  </form>
                )}
                {item.moderation_status !== "rejected" && (
                  <form action={rejectClassifiedAction.bind(null, item.id)}>
                    <button type="submit" className="admin-btn admin-btn--reject">
                      Odrzuć
                    </button>
                  </form>
                )}
                <form action={deleteClassifiedAction.bind(null, item.id)}>
                  <button
                    type="submit"
                    className="admin-btn admin-btn--delete"
                    onClick={(e) => {
                      if (!confirm("Na pewno usunąć to ogłoszenie?")) e.preventDefault();
                    }}
                  >
                    Usuń
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
