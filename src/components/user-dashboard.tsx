import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteShell } from "./site-shell";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const STATUS_LABEL: Record<string, string> = {
  pending: "Oczekuje",
  approved: "Aktywne",
  rejected: "Odrzucone",
  expired: "Wygasłe",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "color:#d88f12;background:#fff8ed;",
  approved: "color:#2d5c3f;background:#edf5f0;",
  rejected: "color:#b42318;background:#fff1f0;",
  expired: "color:#5f6f64;background:#f3f3ef;",
};

export async function UserDashboard() {
  const supabaseReady = isSupabaseConfigured();

  if (!supabaseReady) {
    redirect("/zaloguj-sie/");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/zaloguj-sie/");
  }

  const userEmail = user.email ?? "";

  const { data: items, error } = await supabase
    .from("classifieds")
    .select("id,title,slug,moderation_status,views_count,created_at,expires_at,featured")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const listings = error ? [] : (items ?? []);
  const totalViews = listings.reduce((sum, l) => sum + (l.views_count ?? 0), 0);
  const activeCount = listings.filter((l) => l.moderation_status === "approved").length;

  return (
    <SiteShell>
      <div className="custom-page">
        {/* Header */}
        <section className="user-dash-header">
          <div className="user-dash-header__inner">
            <div>
              <p className="page-card__eyebrow">Panel konta</p>
              <h1 style={{ margin: "4px 0 6px", fontSize: "clamp(1.6rem,2.5vw,2.4rem)" }}>
                Moje ogłoszenia
              </h1>
              <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.95rem" }}>
                Zalogowano jako <strong>{userEmail}</strong>
              </p>
            </div>
            <Link href="/dodaj-ogloszenie/" className="primary-button" style={{ alignSelf: "center", whiteSpace: "nowrap" }}>
              + Dodaj ogłoszenie
            </Link>
          </div>
        </section>

        {/* Stats */}
        <div className="user-dash-stats">
          <div className="user-stat-card">
            <span className="user-stat-card__number">{listings.length}</span>
            <span className="user-stat-card__label">Ogłoszeń łącznie</span>
          </div>
          <div className="user-stat-card">
            <span className="user-stat-card__number user-stat-card__number--accent">{activeCount}</span>
            <span className="user-stat-card__label">Aktywnych</span>
          </div>
          <div className="user-stat-card">
            <span className="user-stat-card__number">{totalViews}</span>
            <span className="user-stat-card__label">Wyświetleń</span>
          </div>
        </div>

        {listings.length === 0 ? (
          /* Empty state */
          <section className="user-dash-empty">
            <div className="user-dash-empty__icon">📋</div>
            <h2>Nie masz jeszcze żadnych ogłoszeń</h2>
            <p>
              Dodaj pierwsze ogłoszenie i dotrzyj do tysięcy kupujących biomasy,
              pellet, zrębki, maszyny leśne i sprzęt OZE.
            </p>
            <div className="button-row" style={{ justifyContent: "center", marginTop: 24 }}>
              <Link href="/dodaj-ogloszenie/" className="primary-button" style={{ fontSize: "1.05rem", padding: "14px 32px" }}>
                Dodaj ogłoszenie
              </Link>
            </div>
            <ul className="user-dash-empty__benefits">
              <li>✓ Bezpłatne ogłoszenie podstawowe</li>
              <li>✓ Widoczność dla kupujących z całej Polski</li>
              <li>✓ Wyróżnienie ogłoszenia już od 29 zł</li>
              <li>✓ Statystyki wyświetleń w panelu</li>
            </ul>
          </section>
        ) : (
          /* Listings list */
          <section className="user-dash-listings">
            <div className="user-dash-listings__grid">
              {listings.map((item) => {
                const status = item.moderation_status ?? "pending";
                const label = STATUS_LABEL[status] ?? status;
                const style = STATUS_COLOR[status] ?? "";
                const expires = item.expires_at
                  ? new Date(item.expires_at).toLocaleDateString("pl-PL")
                  : null;
                return (
                  <div key={item.id} className="user-listing-card">
                    <div className="user-listing-card__top">
                      <div className="user-listing-card__meta">
                        <span
                          className="user-listing-card__badge"
                          style={{ cssText: style } as React.CSSProperties}
                        >
                          {label}
                        </span>
                        {item.featured && (
                          <span className="user-listing-card__badge" style={{ background: "#fff8ed", color: "#d88f12" }}>
                            ⭐ Wyróżnione
                          </span>
                        )}
                      </div>
                      <span className="user-listing-card__views">👁 {item.views_count ?? 0}</span>
                    </div>
                    <h3 className="user-listing-card__title">{item.title}</h3>
                    {expires && (
                      <p className="user-listing-card__expires">Wygasa: {expires}</p>
                    )}
                    <div className="user-listing-card__actions">
                      <Link href={`/ogloszenia/${item.slug}/`} className="secondary-button" style={{ fontSize: "0.85rem", padding: "8px 16px" }}>
                        Zobacz
                      </Link>
                      <button
                        type="button"
                        className="primary-button"
                        style={{ fontSize: "0.85rem", padding: "8px 16px" }}
                        disabled
                        title="Wkrótce"
                      >
                        Przedłuż
                      </button>
                      {!item.featured && (
                        <button
                          type="button"
                          className="secondary-button"
                          style={{ fontSize: "0.85rem", padding: "8px 16px" }}
                          disabled
                          title="Wkrótce"
                        >
                          ⭐ Wyróżnij
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Upsell */}
            <div className="user-dash-upsell">
              <div>
                <strong>Chcesz więcej wyświetleń?</strong>
                <span> Wyróżnione ogłoszenia są widoczne na górze list i w boksach premium.</span>
              </div>
              <Link href="/dodaj-ogloszenie/" className="primary-button" style={{ whiteSpace: "nowrap" }}>
                Wyróżnij ogłoszenie
              </Link>
            </div>
          </section>
        )}
      </div>
    </SiteShell>
  );
}
