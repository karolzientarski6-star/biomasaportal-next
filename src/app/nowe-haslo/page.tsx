import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { NewPasswordForm } from "@/components/new-password-form";

export const metadata: Metadata = {
  title: "Nowe hasło – BiomasaPortal",
  description: "Ustaw nowe hasło do swojego konta BiomasaPortal.",
  robots: { index: false, follow: false },
};

export default function NewPasswordPage() {
  return (
    <SiteShell>
      <div className="custom-page">
        <section className="page-card">
          <div className="page-card__header">
            <p className="page-card__eyebrow">Resetowanie hasła</p>
            <h1>Ustaw nowe hasło</h1>
            <p>Wpisz swoje nowe hasło. Minimum 8 znaków.</p>
          </div>
          <div className="page-card__body">
            <div className="form-panel">
              <NewPasswordForm />
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
