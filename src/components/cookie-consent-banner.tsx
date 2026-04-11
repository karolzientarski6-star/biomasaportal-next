"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useConsent } from "@/components/consent-provider";
import { createConsentPreferences, type ConsentPreferences } from "@/lib/consent";

type ConsentDraft = Pick<
  ConsentPreferences,
  "analytics" | "functionality" | "personalization" | "marketing"
>;

const CONSENT_OPTIONS: Array<{
  key: keyof ConsentDraft | "necessary";
  title: string;
  description: string;
  readonly?: boolean;
}> = [
  {
    key: "necessary",
    title: "Niezbedne",
    description:
      "Wymagane do prawidlowego dzialania strony, logowania, bezpieczenstwa i podstawowych funkcji.",
    readonly: true,
  },
  {
    key: "analytics",
    title: "Analityczne",
    description:
      "Pomagaja nam mierzyc ruch i zrozumiec, jak uzytkownicy korzystaja z serwisu, np. w Google Analytics 4.",
  },
  {
    key: "functionality",
    title: "Funkcjonalne",
    description:
      "Zapamietuja preferencje interfejsu i pomagaja utrzymac wygodne dzialanie dodatkowych funkcji.",
  },
  {
    key: "personalization",
    title: "Personalizacja",
    description:
      "Pozwalaja dopasowac tresci i doswiadczenie do Twoich wczesniejszych wyborow.",
  },
  {
    key: "marketing",
    title: "Marketingowe",
    description:
      "Umozliwiaja remarketing, sygnaly reklamowe i dokladniejsze mierzenie skutecznosci kampanii.",
  },
];

function toDraft(consent: ConsentPreferences): ConsentDraft {
  return {
    analytics: consent.analytics,
    functionality: consent.functionality,
    personalization: consent.personalization,
    marketing: consent.marketing,
  };
}

export function CookieConsentBanner() {
  const { consent, hasStoredConsent, acceptAll, rejectOptional, savePreferences } =
    useConsent();
  const [draft, setDraft] = useState<ConsentDraft>(() => toDraft(consent));
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setDraft(toDraft(consent));
  }, [consent]);

  useEffect(() => {
    const handleOpen = () => {
      setDraft(toDraft(window.__biomasaConsent || consent));
      setIsModalOpen(true);
    };

    window.addEventListener("biomasa:open-cookie-settings", handleOpen);
    return () => {
      window.removeEventListener("biomasa:open-cookie-settings", handleOpen);
    };
  }, [consent]);

  const showMiniBanner = !hasStoredConsent && !isModalOpen;

  const handleToggle = (key: keyof ConsentDraft) => {
    setDraft((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const handleOpenSettings = () => {
    setDraft(toDraft(consent));
    setIsModalOpen(true);
  };

  const handleAcceptAll = () => {
    setIsModalOpen(false);
    acceptAll();
  };

  const handleRejectOptional = () => {
    setIsModalOpen(false);
    rejectOptional();
  };

  const handleSave = () => {
    setIsModalOpen(false);
    savePreferences(
      createConsentPreferences({
        ...draft,
        source: "save_preferences",
      }),
    );
  };

  return (
    <>
      {hasStoredConsent ? (
        <button
          type="button"
          className="cookie-settings-trigger"
          onClick={handleOpenSettings}
          aria-label="Otworz ustawienia cookies"
        >
          Ustawienia cookies
        </button>
      ) : null}

      {showMiniBanner ? (
        <div className="cookie-mini-shell" role="dialog" aria-modal="false">
          <section className="cookie-mini-banner" aria-label="Baner cookies">
            <div className="cookie-mini-banner__icon" aria-hidden="true">
              Cookies
            </div>
            <div className="cookie-mini-banner__copy">
              <h2>Ta strona uzywa plikow cookies</h2>
              <p>
                Uzywamy cookies do analizy ruchu i personalizacji tresci. Mozesz
                zaakceptowac wszystkie albo dostosowac swoje preferencje.{" "}
                <Link href="/polityka-prywatnosci/">Dowiedz sie wiecej</Link>
              </p>
            </div>
            <div className="cookie-mini-banner__actions">
              <button
                type="button"
                className="cookie-button cookie-button--muted"
                onClick={handleRejectOptional}
              >
                Odrzuc wszystkie
              </button>
              <button
                type="button"
                className="cookie-button cookie-button--ghost"
                onClick={handleOpenSettings}
              >
                Dostosuj
              </button>
              <button
                type="button"
                className="cookie-button cookie-button--primary"
                onClick={handleAcceptAll}
              >
                Akceptuj wszystkie
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {isModalOpen ? (
        <div className="cookie-modal-shell" role="dialog" aria-modal="true">
          <div
            className="cookie-modal-backdrop"
            onClick={() => setIsModalOpen(false)}
          />
          <section className="cookie-modal" aria-label="Centrum prywatnosci">
            <div className="cookie-modal__header">
              <div>
                <h2>Centrum prywatnosci</h2>
                <p>
                  Uzywamy plikow cookies, aby zapewnic prawidlowe dzialanie strony
                  i analizowac ruch. Mozesz dostosowac swoje preferencje ponizej.{" "}
                  <Link href="/polityka-prywatnosci/">Polityka prywatnosci</Link>
                </p>
              </div>
              <button
                type="button"
                className="cookie-modal__close"
                onClick={() => setIsModalOpen(false)}
                aria-label="Zamknij centrum prywatnosci"
              >
                x
              </button>
            </div>

            <div className="cookie-modal__content">
              {CONSENT_OPTIONS.map((option) => {
                const isReadonly = option.readonly;
                const isEnabled =
                  option.key === "necessary"
                    ? true
                    : draft[option.key as keyof ConsentDraft];

                return (
                  <article className="cookie-preference-card" key={option.key}>
                    <div className="cookie-preference-card__top">
                      <div className="cookie-preference-card__copy">
                        <div className="cookie-preference-card__title-row">
                          <h3>{option.title}</h3>
                          {isReadonly ? (
                            <span className="cookie-preference-card__badge">
                              Zawsze aktywne
                            </span>
                          ) : null}
                        </div>
                        <p>{option.description}</p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isEnabled}
                        className={`cookie-switch${isEnabled ? " is-active" : ""}`}
                        onClick={
                          isReadonly
                            ? undefined
                            : () => handleToggle(option.key as keyof ConsentDraft)
                        }
                        disabled={isReadonly}
                      >
                        <span className="cookie-switch__track">
                          <span className="cookie-switch__thumb" />
                        </span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="cookie-modal__footer">
              <button
                type="button"
                className="cookie-button cookie-button--muted"
                onClick={handleRejectOptional}
              >
                Odrzuc wszystkie
              </button>
              <button
                type="button"
                className="cookie-button cookie-button--ghost"
                onClick={handleSave}
              >
                Zapisz moje wybory
              </button>
              <button
                type="button"
                className="cookie-button cookie-button--primary"
                onClick={handleAcceptAll}
              >
                Akceptuj wszystkie
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
