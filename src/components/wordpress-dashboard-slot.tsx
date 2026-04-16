import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/actions/auth";

export async function WordPressDashboardSlot() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="biomasa-dashboard__guest">
        <p>Musisz być zalogowany, aby zobaczyć panel użytkownika.</p>
        <Link href="/zaloguj-sie/" className="primary-button">
          Zaloguj się
        </Link>
      </div>
    );
  }

  const { data: items, error } = await supabase
    .from("classifieds")
    .select("id,title,slug,moderation_status,views_count")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="biomasa-dashboard">
      <div className="biomasa-dashboard__topbar">
        <div className="biomasa-dashboard__user">
          <h1>Moje ogłoszenia</h1>
          <p>Zalogowano jako <strong>{user.email}</strong></p>
        </div>
        <div className="biomasa-dashboard__topbar-actions">
          <Link href="/dodaj-ogloszenie/" className="primary-button">
            + Dodaj ogłoszenie
          </Link>
          <form action={signOutAction}>
            <button type="submit" className="secondary-button">
              Wyloguj się
            </button>
          </form>
        </div>
      </div>

      {error ? (
        <div className="biomasa-form-message is-error">{error.message}</div>
      ) : null}

      {items && items.length > 0 ? (
        <div className="biomasa-dashboard__list">
          {items.map((item) => (
            <article key={item.id} className="biomasa-dashboard-card">
              <div className="biomasa-dashboard-card__body">
                <h3>{item.title}</h3>
                <div className="biomasa-dashboard-card__meta">
                  <span className={`status-pill status-pill--${item.moderation_status}`}>
                    {item.moderation_status === "approved" ? "✓ Aktywne" :
                     item.moderation_status === "pending" ? "⏳ Oczekuje" :
                     item.moderation_status === "rejected" ? "✗ Odrzucone" :
                     item.moderation_status}
                  </span>
                  <span>{item.views_count ?? 0} wyświetleń</span>
                </div>
              </div>
              <div className="biomasa-dashboard-card__actions">
                <Link href={`/ogloszenia/${item.slug}/`} className="secondary-button">
                  Zobacz
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="biomasa-dashboard__empty">
          <p>Nie masz jeszcze żadnych ogłoszeń.</p>
          <Link href="/dodaj-ogloszenie/" className="primary-button">
            Dodaj pierwsze ogłoszenie
          </Link>
        </div>
      )}
    </div>
  );
}
