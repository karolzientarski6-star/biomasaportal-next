import Link from "next/link";
import { headers } from "next/headers";
import { SiteShell } from "./site-shell";
import { SignUpForm } from "./auth-forms";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function RegistrationPage() {
  const supabaseReady = isSupabaseConfigured();
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  const origin = `${protocol}://${host}`;

  return (
    <SiteShell>
      <div className="custom-page">
        <section className="page-card">
          <div className="page-card__header">
            <p className="page-card__eyebrow">Konta użytkowników</p>
            <h1>Załóż konto</h1>
            <p>
              Ta strona odwzorowuje aktualny onboarding z WordPressa i jest
              przygotowana do przepięcia na Supabase Auth z potwierdzeniem email
              oraz panelem użytkownika.
            </p>
          </div>
          <div className="page-card__body">
            <div className={supabaseReady ? "status-banner" : "status-banner warn"}>
              {supabaseReady ? (
                <span>
                  Konfiguracja Supabase jest wykryta. Możemy podpinać realną
                  rejestrację i flow aktywacji konta.
                </span>
              ) : (
                <span>
                  Brakuje danych Supabase. UI i struktura formularza są gotowe,
                  ale zapis jest wyłączony do czasu podania kluczy.
                </span>
              )}
            </div>

            <div className="form-panel">
              <SignUpForm origin={origin} />
              <div style={{ marginTop: 20 }}>
                <div className="notice-card">
                  <strong>Co zachowujemy z WordPressa:</strong>
                  <p>
                    darmowe konto, panel zarządzania ogłoszeniami, statystyki
                    wyświetleń, moderację i ścieżkę aktywacji email.
                  </p>
                </div>

                <div className="button-row" style={{ marginTop: 16 }}>
                  <Link href="/moje-ogloszenia/" className="secondary-button">
                    Przejdź do panelu
                  </Link>
                  <Link href="/zaloguj-sie/" className="secondary-button">
                    Mam już konto
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
