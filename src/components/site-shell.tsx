import Link from "next/link";
import { signOutAction } from "@/app/actions/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SiteShellProps = {
  children: React.ReactNode;
};

const navItems = [
  { href: "/ogloszenia/", label: "Ogloszenia" },
  { href: "/biomasa-w-polsce/", label: "Biomasa w Polsce" },
  { href: "/wpisy/", label: "Wpisy" },
  { href: "/moje-ogloszenia/", label: "Moje ogloszenia", showWhenLoggedIn: true },
  { href: "/zaloz-konto/", label: "Zaloz konto", hideWhenLoggedIn: true },
  { href: "/zaloguj-sie/", label: "Zaloguj sie", hideWhenLoggedIn: true },
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
            <img
              src="/wp-content/uploads/2024/01/cropped-biomasaportal.png"
              alt="BiomasaPortal"
              width={40}
              height={40}
              className="site-brand__logo"
            />
            <div className="site-brand__text">
              <strong>BiomasaPortal</strong>
              <span>Next.js migration</span>
            </div>
          </Link>

          <nav className="site-nav" aria-label="Glowna nawigacja">
            {navItems
              .filter((item) => {
                if (item.hideWhenLoggedIn && userEmail) return false;
                if (item.showWhenLoggedIn && !userEmail) return false;
                return true;
              })
              .map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            <Link href="/dodaj-ogloszenie/" className="site-nav__cta">
              Dodaj ogloszenie
            </Link>
            {userEmail ? (
              <form action={signOutAction}>
                <button type="submit" className="secondary-button">
                  Wyloguj
                </button>
              </form>
            ) : null}
          </nav>
        </div>
      </header>

      <main className="site-main">{children}</main>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <span>(c) {new Date().getFullYear()} Biomasa Portal</span>
          <nav className="site-footer__nav" aria-label="Nawigacja stopki">
            <Link href="/ogloszenia/">Ogloszenia</Link>
            <Link href="/dodaj-ogloszenie/">Dodaj ogloszenie</Link>
            <Link href="/moje-ogloszenia/">Moje ogloszenia</Link>
            <Link href="/zaloguj-sie/">Zaloguj sie</Link>
            <Link href="/zaloz-konto/">Zaloz konto</Link>
            <Link href="/polityka-prywatnosci/">Polityka prywatnosci</Link>
            <Link href="/regulamin/">Regulamin</Link>
          </nav>
          <address className="site-footer__contact">
            <a href="tel:+48511430886">+48 511 430 886</a>
            {" | "}
            <a href="mailto:kontakt@biomasaportal.pl">kontakt@biomasaportal.pl</a>
          </address>
        </div>
      </footer>
    </div>
  );
}
