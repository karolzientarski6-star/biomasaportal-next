import Link from "next/link";
import { signOutAction } from "@/app/actions/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SiteShellProps = {
  children: React.ReactNode;
};

const navItems = [
  { href: "/ogloszenia/", label: "Ogłoszenia" },
  { href: "/biomasa-w-polsce/", label: "Biomasa w Polsce" },
  { href: "/wpisy/", label: "Wpisy" },
  { href: "/dodaj-ogloszenie/", label: "Dodaj ogłoszenie" },
  { href: "/moje-ogloszenia/", label: "Moje ogłoszenia" },
  { href: "/zaloz-konto/", label: "Załóż konto", hideWhenLoggedIn: false },
  { href: "/zaloguj-sie/", label: "Zaloguj się", hideWhenLoggedIn: true },
];

export async function SiteShell({ children }: SiteShellProps) {
  let userEmail: string | null = null;

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email ?? null;
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-header__inner">
          <Link href="/" className="site-brand">
            {/* Logo — serwowane przez rewrite /wp-content/ → wp.biomasaportal.pl */}
            <img
              src="/wp-content/uploads/2024/01/cropped-biomasaportal.png"
              alt="BiomasaPortal"
              width={40}
              height={40}
              className="site-brand__logo"
            />
            <div className="site-brand__text">
              <strong>BiomasaPortal</strong>
            </div>
          </Link>

          <nav className="site-nav" aria-label="Główna nawigacja">
            {navItems
              .filter((item) =>
                item.hideWhenLoggedIn ? !userEmail : true,
              )
              .map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            {userEmail ? (
              <>
                <span className="site-nav__user">{userEmail}</span>
                <form action={signOutAction}>
                  <button type="submit" className="secondary-button">
                    Wyloguj
                  </button>
                </form>
              </>
            ) : null}
          </nav>
        </div>
      </header>

      <main className="site-main">{children}</main>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <span>© {new Date().getFullYear()} Biomasa Portal</span>
          <nav className="site-footer__nav" aria-label="Nawigacja stopki">
            <Link href="/ogloszenia/">Ogłoszenia</Link>
            <Link href="/polityka-prywatnosci/">Polityka prywatności</Link>
            <Link href="/regulamin/">Regulamin</Link>
          </nav>
          <address className="site-footer__contact">
            <a href="tel:+48511430886">+48 511 430 886</a>
            {" · "}
            <a href="mailto:kontakt@biomasaportal.pl">kontakt@biomasaportal.pl</a>
          </address>
        </div>
      </footer>
    </div>
  );
}
