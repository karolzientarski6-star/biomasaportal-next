import Link from "next/link";
import { signOutAction } from "@/app/actions/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SiteShellProps = {
  children: React.ReactNode;
};

const navItems = [
  { href: "/", label: "Start" },
  { href: "/ogloszenia/", label: "Ogłoszenia" },
  { href: "/wpisy/", label: "Wpisy" },
  { href: "/dodaj-ogloszenie/", label: "Dodaj ogłoszenie" },
  { href: "/moje-ogloszenia/", label: "Moje ogłoszenia" },
  { href: "/zaloz-konto/", label: "Załóż konto" },
  { href: "/zaloguj-sie/", label: "Zaloguj się" },
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
            <div className="site-brand__mark">BP</div>
            <div className="site-brand__text">
              <strong>BiomasaPortal</strong>
              <span>Migracja Next.js</span>
            </div>
          </Link>

          <nav className="site-nav" aria-label="Główna nawigacja">
            {navItems
              .filter((item) => (userEmail ? item.href !== "/zaloguj-sie/" : true))
              .map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            {userEmail ? (
              <>
                <span>{userEmail}</span>
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
          <span>BiomasaPortal.pl</span>
          <span>{"WordPress -> Next.js + Supabase"}</span>
        </div>
      </footer>
    </div>
  );
}
