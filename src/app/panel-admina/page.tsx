import { requireAdmin } from "@/lib/admin";
import { EDITORIAL_CATEGORIES } from "@/lib/editorial-categories";
import {
  getEditorialArticles,
  getEditorialSchedulePreview,
  getEditorialSeedArticles,
} from "@/lib/editorial";
import { SiteShell } from "@/components/site-shell";
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

export default async function AdminPanelPage() {
  const { email } = await requireAdmin();
  const [seedArticles, dbArticles, schedulePreview] = await Promise.all([
    getEditorialSeedArticles(),
    getEditorialArticles(),
    getEditorialSchedulePreview(12),
  ]);

  const queued = summarizeStatus(dbArticles, "queued");
  const published = summarizeStatus(dbArticles, "published");
  const alreadyPublished = summarizeStatus(dbArticles, "already_published");

  return (
    <SiteShell>
      <div className="custom-page">
        <section className="page-card">
          <div className="page-card__header">
            <p className="page-card__eyebrow">Panel administratora</p>
            <h1>Kolejka publikacji BiomasaPortal</h1>
            <p>
              Panel zarzadza seedem z Excela, kolejka do publikacji i automatyczna
              publikacja 5 wpisow tygodniowo. Aktualnie zalogowany: <strong>{email}</strong>.
            </p>
          </div>
          <div className="page-card__body">
            <div className="feature-grid">
              <article className="feature-card">
                <h3>Seed z Excela</h3>
                <p>{seedArticles.length} rekordow zaimportowanych do lokalnego seedu.</p>
              </article>
              <article className="feature-card">
                <h3>Juz opublikowane</h3>
                <p>{alreadyPublished} wpisow oznaczonych jako juz opublikowane.</p>
              </article>
              <article className="feature-card">
                <h3>W kolejce</h3>
                <p>{queued} wpisow czeka na automatyczna lub reczna publikacje.</p>
              </article>
              <article className="feature-card">
                <h3>Nowy silnik redakcyjny</h3>
                <p>{published} wpisow opublikowanych bezposrednio z Next.js.</p>
              </article>
            </div>

            <div className="button-row" style={{ marginTop: 24 }}>
              <form
                action={async () => {
                  "use server";
                  await syncEditorialSeedAction();
                }}
              >
                <button type="submit" className="primary-button">
                  Synchronizuj seed do Supabase
                </button>
              </form>
              <form
                action={async () => {
                  "use server";
                  await publishNextEditorialBatchAction(5);
                }}
              >
                <button type="submit" className="secondary-button">
                  Opublikuj recznie kolejne 5 wpisow
                </button>
              </form>
            </div>

            <div className="support-card" style={{ marginTop: 24 }}>
              <h3>Automatyzacja tygodniowa</h3>
              <p>
                Vercel cron wywola endpoint raz w tygodniu, a publikacja pojdzie po
                <strong> sort_order</strong> w paczkach po 5 wpisow. Do produkcji potrzebne
                sa zmienne <code>CRON_SECRET</code>, <code>ADMIN_EMAILS</code> i odswiezony
                schemat Supabase z tabela <code>editorial_articles</code>.
              </p>
            </div>

            <div className="support-card" style={{ marginTop: 24 }}>
              <h3>Kolejka publikacji i terminy</h3>
              {schedulePreview.length > 0 ? (
                <ol className="editorial-queue-list">
                  {schedulePreview.map((article) => (
                    <li key={article.id}>
                      <div>
                        <strong>{article.title}</strong>
                        <span>{article.categoryName}</span>
                      </div>
                      <time dateTime={article.scheduledFor ?? undefined}>
                        {article.scheduledFor
                          ? new Intl.DateTimeFormat("pl-PL", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }).format(new Date(article.scheduledFor))
                          : "Do zsynchronizowania"}
                      </time>
                    </li>
                  ))}
                </ol>
              ) : (
                <p>Brak oczekujacych wpisow w kolejce.</p>
              )}
            </div>

            <div className="support-card" style={{ marginTop: 24 }}>
              <h3>Kategorie tresci pod mega menu i SEO</h3>
              <div className="feature-grid">
                {EDITORIAL_CATEGORIES.map((category) => (
                  <article key={category.slug} className="feature-card">
                    <p className="page-card__eyebrow">{category.accentLabel}</p>
                    <h3>{category.name}</h3>
                    <p>{category.shortDescription}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
