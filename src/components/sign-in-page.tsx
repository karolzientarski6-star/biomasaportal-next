import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteShell } from "./site-shell";
import { SignInForm } from "./auth-forms";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function SignInPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim());
    redirect(adminEmails.includes(user.email ?? "") ? "/panel-admina/" : "/moje-ogloszenia/");
  }

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
            <div className="form-panel">
              <SignInForm />
              <div className="button-row" style={{ marginTop: 16 }}>
                <Link href="/zaloz-konto/" className="secondary-button">
                  Załóż konto
                </Link>
                <Link href="/zapomniales-hasla/" className="secondary-button">
                  Zapomniałeś hasła?
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
