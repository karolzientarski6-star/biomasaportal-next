import Link from "next/link";
import { SiteShell } from "./site-shell";
import { SignInForm } from "./auth-forms";
import { isSupabaseConfigured } from "@/lib/supabase";

export function SignInPage() {
  const supabaseReady = isSupabaseConfigured();

  return (
    <SiteShell>
      <div className="custom-page">
        <section className="page-card">
          <div className="page-card__header">
            <p className="page-card__eyebrow">Logowanie</p>
            <h1>Zaloguj się</h1>
            <p>Panel logowania do kont użytkowników i zarządzania ogłoszeniami.</p>
          </div>
          <div className="page-card__body">
            <div className={supabaseReady ? "status-banner" : "status-banner warn"}>
              {supabaseReady ? (
                <span>Logowanie jest podpięte pod Supabase Auth.</span>
              ) : (
                <span>Brakuje konfiguracji Supabase, więc logowanie nie zadziała.</span>
              )}
            </div>

            <div className="form-panel">
              <SignInForm />
              <div className="button-row" style={{ marginTop: 16 }}>
                <Link href="/zaloz-konto/" className="secondary-button">
                  Załóż konto
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
