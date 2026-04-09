import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteShell } from "./site-shell";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function UserDashboard() {
  const supabaseReady = isSupabaseConfigured();
  let userEmail: string | null = null;
  let items:
    | Array<{
        id: string;
        title: string;
        slug: string;
        moderation_status: string;
        views_count: number;
      }>
    | null = null;
  let loadError: string | null = null;

  if (supabaseReady) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/zaloguj-sie/");
    }

    userEmail = user.email ?? null;

    const { data, error } = await supabase
      .from("classifieds")
      .select("id,title,slug,moderation_status,views_count")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      loadError =
        error.message.includes("relation") || error.message.includes("schema")
          ? "Tabela `classifieds` nie istnieje jeszcze w Supabase. Najpierw odpal schema.sql."
          : error.message;
    } else {
      items = data;
    }
  }

  return (
    <SiteShell>
      <div className="custom-page">
        <section className="page-card">
          <div className="page-card__header">
            <p className="page-card__eyebrow">Panel użytkownika</p>
            <h1>Moje ogłoszenia</h1>
            <p>
              To jest nowy ekran panelu pod Next.js, zbudowany na podstawie
              aktualnego shortcode&apos;u WordPressa i przygotowany pod logowanie
              Supabase.
            </p>
          </div>
          <div className="page-card__body">
            <div className={supabaseReady ? "status-banner" : "status-banner warn"}>
              {supabaseReady ? (
                <span>
                  Supabase jest skonfigurowany. W kolejnym kroku podpinam
                  realne logowanie, właścicieli ogłoszeń i akcje usuń/przedłuż/wyróżnij.
                </span>
              ) : (
                <span>
                  Widok i struktura panelu są gotowe, ale logowanie i dane
                  użytkowników czekają na pełne spięcie Supabase.
                </span>
              )}
            </div>

            <div className="dashboard-panel">
              <div className="button-row" style={{ marginBottom: 18 }}>
                <Link href="/dodaj-ogloszenie/" className="primary-button">
                  Dodaj ogłoszenie
                </Link>
                <Link href="/zaloz-konto/" className="secondary-button">
                  Aktywuj konto
                </Link>
              </div>

              {userEmail ? <div className="notice-card">Zalogowano jako: <strong>{userEmail}</strong></div> : null}
              {loadError ? (
                <div className="status-banner error" style={{ marginTop: 16 }}>
                  {loadError}
                </div>
              ) : null}

              {items && items.length > 0 ? (
                <table className="table-list">
                  <thead>
                    <tr>
                      <th>Tytuł</th>
                      <th>Status</th>
                      <th>Wyświetlenia</th>
                      <th>Akcje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.title}</td>
                        <td>{item.moderation_status}</td>
                        <td>{item.views_count}</td>
                        <td>
                          <div className="button-row">
                            <Link href={`/ogloszenia/${item.slug}/`} className="secondary-button">
                              Zobacz
                            </Link>
                            <button type="button" className="primary-button">
                              Przedłuż
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  Nie znaleziono jeszcze ogłoszeń przypisanych do tego konta.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
