import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Resetowanie hasła – BiomasaPortal",
  description: "Wyślij link do resetowania hasła na swój adres email.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <SiteShell>
      <div className="custom-page">
        <section className="page-card">
          <div className="page-card__header">
            <p className="page-card__eyebrow">Odzyskiwanie konta</p>
            <h1>Zapomniałeś hasła?</h1>
            <p>
              Podaj adres email przypisany do konta. Wyślemy Ci link, który
              pozwoli ustawić nowe hasło.
            </p>
          </div>
          <div className="page-card__body">
            <div className="form-panel">
              <ForgotPasswordForm />
              <div className="button-row" style={{ marginTop: 16 }}>
                <Link href="/zaloguj-sie/" className="secondary-button">
                  Wróć do logowania
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
