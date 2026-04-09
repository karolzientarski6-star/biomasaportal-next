import Link from "next/link";
import { SiteShell } from "./site-shell";
import { ClassifiedFormPanel } from "./classified-form-panel";
import { isSupabaseConfigured } from "@/lib/supabase";

export function ClassifiedForm() {
  const supabaseReady = isSupabaseConfigured();

  return (
    <SiteShell>
      <div className="custom-page">
        <section className="page-card">
          <div className="page-card__header">
            <p className="page-card__eyebrow">Panel ogłoszeń</p>
            <h1>Dodaj ogłoszenie</h1>
            <p>
              Ekran odwzorowuje aktualną stronę dodawania ogłoszenia i jest
              przygotowany pod przepięcie na Supabase Auth, Storage i własne
              API moderacji.
            </p>
          </div>
          <div className="page-card__body">
            <div className={supabaseReady ? "status-banner" : "status-banner warn"}>
              {supabaseReady ? (
                <span>
                  Supabase jest skonfigurowany. Następny krok to podpięcie
                  rzeczywistych akcji zapisu, uploadów i checkoutu Stripe.
                </span>
              ) : (
                <span>
                  Brakuje jeszcze kluczy Supabase w `.env.local`, więc formularz
                  jest gotowy wizualnie i strukturalnie, ale zapis został celowo
                  wstrzymany, żeby nie zgubić danych użytkowników.
                </span>
              )}
            </div>

            <div className="form-panel">
              <ClassifiedFormPanel disabled={!supabaseReady} />
              <div style={{ marginTop: 20 }}>
                <div className="feature-grid">
                  <article className="feature-card">
                    <h3>Z kontem użytkownika</h3>
                    <p>Darmowa publikacja na 30 dni, panel zarządzania i statystyki.</p>
                  </article>
                  <article className="feature-card">
                    <h3>Bez konta</h3>
                    <p>Jednorazowa publikacja za 19,99 PLN + VAT przez checkout Stripe.</p>
                  </article>
                  <article className="feature-card">
                    <h3>Wyróżnienie</h3>
                    <p>Dopłata 15,00 PLN + VAT i ekspozycja na górze listy ogłoszeń.</p>
                  </article>
                </div>

                <div className="button-row" style={{ marginTop: 16 }}>
                  <Link href="/zaloz-konto/" className="secondary-button">
                    Załóż konto
                  </Link>
                  <Link href="/zaloguj-sie/" className="secondary-button">
                    Zaloguj się
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
