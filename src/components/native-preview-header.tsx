"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { EDITORIAL_CATEGORIES } from "@/lib/editorial-categories";

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function MegaMenu() {
  return (
    <div className="native-site-header__mega">
      <Link href="/biomasa-w-polsce/" className="native-site-header__nav-link">
        Biomasa w Polsce
      </Link>
      <div className="native-site-header__mega-panel">
        {EDITORIAL_CATEGORIES.map((category) => (
          <Link
            key={category.slug}
            href={`/biomasa-w-polsce/${category.slug}/`}
            className="native-site-header__mega-card"
          >
            <span className="native-site-header__mega-eyebrow">
              {category.accentLabel}
            </span>
            <strong>{category.name}</strong>
            <span>{category.shortDescription}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function MobileClusterLinks({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="native-site-header__mobile-clusters">
      <p>Biomasa w Polsce</p>
      <div className="native-site-header__mobile-cluster-grid">
        {EDITORIAL_CATEGORIES.map((category) => (
          <Link
            key={category.slug}
            href={`/biomasa-w-polsce/${category.slug}/`}
            className="native-site-header__mobile-cluster-card"
            onClick={onNavigate}
          >
            <span>{category.accentLabel}</span>
            <strong>{category.name}</strong>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function NativePreviewHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = previousOverflow || "";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <header className="native-site-header">
      <div className="native-site-header__bar">
        <Link href="/" className="native-site-header__brand" aria-label="Biomasa Portal">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/wp-content/uploads/2024/01/biomasaportal.png"
            alt="Biomasa Portal"
            width={200}
            height={200}
            loading="eager"
            fetchPriority="high"
          />
        </Link>

        <nav className="native-site-header__nav" aria-label="Główne menu">
          <Link
            href="/ogloszenia/"
            className={`native-site-header__nav-link${isActivePath(pathname, "/ogloszenia") ? " is-active" : ""}`}
          >
            Ogłoszenia
          </Link>
          <span className="native-site-header__divider" aria-hidden="true">
            |
          </span>
          <MegaMenu />
        </nav>

        <div className="native-site-header__actions">
          <Link href="/dodaj-ogloszenie/" className="native-site-header__button is-primary">
            Dodaj ogłoszenie
          </Link>
          <Link href="/zaloz-konto/" className="native-site-header__button is-secondary">
            Załóż konto
          </Link>
        </div>

        <button
          type="button"
          className="native-site-header__toggle"
          aria-expanded={isOpen}
          aria-controls="native-site-mobile-menu"
          aria-label={isOpen ? "Zamknij menu" : "Otwórz menu"}
          onClick={() => setIsOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div
        className={`native-site-header__mobile-overlay${isOpen ? " is-open" : ""}`}
        onClick={() => setIsOpen(false)}
      />

      <div
        id="native-site-mobile-menu"
        className={`native-site-header__mobile-panel${isOpen ? " is-open" : ""}`}
        aria-hidden={!isOpen}
      >
        <div className="native-site-header__mobile-head">
          <Link href="/" className="native-site-header__brand" onClick={() => setIsOpen(false)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/wp-content/uploads/2024/01/biomasaportal.png"
              alt="Biomasa Portal"
              width={200}
              height={200}
              loading="lazy"
            />
          </Link>
          <button
            type="button"
            className="native-site-header__mobile-close"
            aria-label="Zamknij menu"
            onClick={() => setIsOpen(false)}
          >
            ×
          </button>
        </div>

        <div className="native-site-header__mobile-actions">
          <Link href="/dodaj-ogloszenie/" className="native-site-header__button is-primary" onClick={() => setIsOpen(false)}>
            Dodaj ogłoszenie
          </Link>
          <Link href="/zaloguj-sie/" className="native-site-header__button is-secondary" onClick={() => setIsOpen(false)}>
            Zaloguj się
          </Link>
          <Link href="/zaloz-konto/" className="native-site-header__button is-tertiary" onClick={() => setIsOpen(false)}>
            Załóż konto
          </Link>
        </div>

        <nav className="native-site-header__mobile-nav" aria-label="Mobilne menu">
          <Link href="/ogloszenia/" onClick={() => setIsOpen(false)}>
            Ogłoszenia
          </Link>
          <Link href="/biomasa-w-polsce/" onClick={() => setIsOpen(false)}>
            Biomasa w Polsce
          </Link>
          <Link href="/wpisy/" onClick={() => setIsOpen(false)}>
            Wpisy
          </Link>
          <Link href="/moje-ogloszenia/" onClick={() => setIsOpen(false)}>
            Moje ogłoszenia
          </Link>
        </nav>

        <MobileClusterLinks onNavigate={() => setIsOpen(false)} />
      </div>
    </header>
  );
}
