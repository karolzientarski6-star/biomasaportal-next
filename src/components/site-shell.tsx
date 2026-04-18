import Link from "next/link";
import { signOutAction } from "@/app/actions/auth";
import { NativePreviewFooter } from "@/components/native-preview-footer";
import { NativePreviewHeader } from "@/components/native-preview-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SiteShellProps = {
  children: React.ReactNode;
};

const navItems = [
  { href: "/ogloszenia/", label: "Ogłoszenia" },
  { href: "/biomasa-w-polsce/", label: "Biomasa w Polsce" },
  { href: "/wpisy/", label: "Wpisy" },
  { href: "/moje-ogloszenia/", label: "Moje ogłoszenia", showWhenLoggedIn: true },
  { href: "/zaloz-konto/", label: "Załóż konto", hideWhenLoggedIn: true },
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
      <NativePreviewHeader />
      {userEmail ? (
        <div className="site-shell__utility">
          <div className="site-shell__utility-inner">
            <span className="site-shell__utility-email">{userEmail}</span>
            <nav className="site-shell__utility-links" aria-label="Panel użytkownika">
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
              <form action={signOutAction}>
                <button type="submit" className="secondary-button">
                  Wyloguj
                </button>
              </form>
            </nav>
          </div>
        </div>
      ) : null}
      <main className="site-main">{children}</main>
      <NativePreviewFooter />
    </div>
  );
}
