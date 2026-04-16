import { requireAdmin } from "@/lib/admin";
import { EDITORIAL_CATEGORIES } from "@/lib/editorial-categories";
import {
  getEditorialArticles,
  getEditorialSchedulePreview,
  getEditorialSeedArticles,
} from "@/lib/editorial";
import { SiteShell } from "@/components/site-shell";
import { AdminClassifieds } from "@/components/admin-classifieds";
import {
  publishNextEditorialBatchAction,
  syncEditorialSeedAction,
} from "@/app/actions/editorial";

function summarizeStatus(
  items: Awaited<ReturnType<typeof getEditorialArticles>>,
  status: string,
) {
  return items.filter((item) => item.publicationStatus === status).length;
}

type StatusFilter = "all" | "pending" | "approved" | "rejected" | "published";

export default async function AdminPanelPage({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string; err?: string; status?: string; section?: string }>;
}) {
  const { email } = await requireAdmin();
  const params = await searchParams;
  const section = params.section ?? "ogloszenia";
  const statusFilter = (params.status ?? "all") as StatusFilter;

  const [seedArticles, dbArticles, schedulePreview] = await Promise.all([
    getEditorialSeedArticles(),
    getEditorialArticles(),
    getEditorialSchedulePreview(12),
  ]);

  const queued = summarizeStatus(dbArticles, "queued");
  const published = summarizeStatus(dbArticles, "published");
  const alreadyPublished = summarizeStatus(dbArticles, "already_published");
  const inDb = dbArticles.some((a) => a.id && !a.id.startsWith("seed-"));

  return (
    <SiteShell>
      <div className="custom-page">
        <section className="page-card">
          <div className="page-card__header">
            <p className="page-card__eyebrow">Panel administratora</p>
            <h1>Panel administratora</h1>
            <p>Zalogowany: <strong>{email}</strong></p>
          </div>

          {/* Section nav */}
          <div className="admin-section-nav">
            <a
              href="/panel-admina/?section=ogloszenia"
              className={`admin-section-tab${section === "ogloszenia" ? " admin-section-tab--active" : ""}`}
            >
              Ogłoszenia
            </a>
            <a
              href="/panel-admina/?section=tresc"
              className={`admin-section-tab${section === "tresc" ? " admin-section-tab--active" : ""}`}
            >
              Kolejka treści
            </a>
          </div>

          <div className="page-card__body">
            {params.msg && (
              <div className="admin-feedback admin-feedback--ok" style={{ marginBottom: 20 }}>
                ✓ {params.msg}
              </div>
            )}
            {params.err && (
              <div className="admin-feedback admin-feedback--err" style={{ marginBottom: 20 }}>
                ✗ {params.err}
              </div>
            )}

            {/* ── OGŁOSZENIA ── */}
            {section === "ogloszenia" && (
              <AdminClassifieds filter={statusFilter} />
            )}

            {/* ── KOLEJKA TREŚCI ── */}
            {section === "tresc" && (
              <>
                <div className="feature-grid" style={{ marginBottom: 24 }}>
                  <article className="feature-card">
                    <h3>Seed z Excela</h3>
                    <p style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--brand-dark)", margin: "4px 0 0" }}>
                      {seedArticles.length}
                    </p>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted)" }}>artykułów w pliku</p>
                  </article>
                  <article className="feature-card">
                    <h3>W kolejce</h3>
                    <p style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--brand)", margin: "4px 0 0" }}>
                      {queued}
                    </p>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted)" }}>czeka na publikację</p>
                  </article>
                  <article className="feature-card">
                    <h3>Opublikowane</h3>
                    <p style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--brand-dark)", margin: "4px 0 0" }}>
                      {published + alreadyPublished}
                    </p>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted)" }}>wpisów live</p>
                  </article>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <div className="admin-step">
                    <div className="admin-step__num">1</div>
                    <div className="admin-step__body">
                      <h4>Zastosuj schemat Supabase (jednorazowo)</h4>
                      <p>
                        Uruchom <code>supabase/schema.sql</code> w{" "}
                        <a href="https://supabase.com/dashboard/project/dbytcmbvsugunwndamne/sql/new"
                          target="_blank" rel="noreferrer" style={{ color: "var(--brand)" }}>
                          Supabase SQL Editor ↗
                        </a>.
                      </p>
                    </div>
                  </div>

                  <div className="admin-step">
                    <div className="admin-step__num">2</div>
                    <div className="admin-step__body">
                      <h4>Synchronizuj seed do Supabase</h4>
                      <p>
                        Ładuje {seedArticles.length} artykułów z pliku JSON do bazy.{" "}
                        {inDb ? (
                          <span style={{ color: "var(--brand)", fontWeight: 600 }}>✓ Baza ma już rekordy.</span>
                        ) : (
                          <span style={{ color: "var(--muted)" }}>Baza jest pusta.</span>
                        )}
                      </p>
                      <form action={async () => {
                        "use server";
                        const result = await syncEditorialSeedAction();
                        const p = new URLSearchParams({ section: "tresc" });
                        if (result.success) p.set("msg", result.success);
                        if (result.error) p.set("err", result.error);
                        const { redirect } = await import("next/navigation");
                        redirect(`/panel-admina/?${p.toString()}`);
                      }}>
                        <button type="submit" className="primary-button">
                          Synchronizuj seed do Supabase
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="admin-step">
                    <div className="admin-step__num">3</div>
                    <div className="admin-step__body">
                      <h4>Opublikuj ręcznie kolejne 5 wpisów</h4>
                      <p>
                        Cron robi to automatycznie w każdy poniedziałek o 7:00 UTC.{" "}
                        {queued === 0 && (
                          <span style={{ color: "var(--muted)" }}>(Brak wpisów w kolejce)</span>
                        )}
                      </p>
                      <form action={async () => {
                        "use server";
                        const result = await publishNextEditorialBatchAction(5);
                        const p = new URLSearchParams({ section: "tresc" });
                        if (result.success) p.set("msg", result.success);
                        if (result.error) p.set("err", result.error);
                        const { redirect } = await import("next/navigation");
                        redirect(`/panel-admina/?${p.toString()}`);
                      }}>
                        <button type="submit" className="secondary-button" disabled={queued === 0}>
                          Opublikuj ręcznie kolejne 5 wpisów
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

                {schedulePreview.length > 0 && (
                  <div className="support-card" style={{ marginTop: 24 }}>
                    <h3 style={{ marginTop: 0 }}>Następne w kolejce</h3>
                    <ol className="editorial-queue-list">
                      {schedulePreview.map((article) => (
                        <li key={article.id}>
                          <div>
                            <strong>{article.title}</strong>
                            <span style={{ marginLeft: 8, fontSize: "0.8rem", color: "var(--muted)" }}>
                              {article.categoryName}
                            </span>
                          </div>
                          <time style={{ fontSize: "0.8rem", color: "var(--muted)", whiteSpace: "nowrap" }}>
                            {article.scheduledFor
                              ? new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric" })
                                  .format(new Date(article.scheduledFor))
                              : "Do zsynchronizowania"}
                          </time>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <div className="support-card" style={{ marginTop: 24 }}>
                  <h3 style={{ marginTop: 0 }}>Kategorie treści</h3>
                  <div className="feature-grid">
                    {EDITORIAL_CATEGORIES.map((category) => (
                      <article key={category.slug} className="feature-card">
                        <p className="page-card__eyebrow">{category.accentLabel}</p>
                        <h3>{category.name}</h3>
                        <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
                          {category.shortDescription}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
