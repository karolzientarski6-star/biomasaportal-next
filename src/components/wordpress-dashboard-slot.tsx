import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function WordPressDashboardSlot() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <p>
        Musisz być zalogowany, aby zobaczyć panel użytkownika.{" "}
        <a href="/zaloguj-sie/">Zaloguj się</a>
      </p>
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
        <div>
          <h2>Moje ogłoszenia</h2>
          <p>Zalogowano jako {user.email}</p>
        </div>
        <Link href="/dodaj-ogloszenie/" className="biomasa-dashboard__cta">
          Dodaj ogłoszenie
        </Link>
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
                  <span>Status: {item.moderation_status}</span>
                  <span>Wyświetlenia: {item.views_count}</span>
                </div>
              </div>
              <div className="biomasa-dashboard-card__actions">
                <Link href={`/ogloszenia/${item.slug}/`}>Zobacz</Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="biomasa-dashboard__empty">
          Nie masz jeszcze przypisanych ogłoszeń. Dodaj pierwsze ogłoszenie z
          panelu.
        </div>
      )}
    </div>
  );
}
