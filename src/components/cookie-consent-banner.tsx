"use client";

import { useEffect, useMemo, useState } from "react";
import { useConsent } from "@/components/consent-provider";
import {
  createConsentPreferences,
  getConsentCategoryLabel,
  type ConsentCategory,
  type ConsentPreferences,
} from "@/lib/consent";

type ConsentDraft = Pick<
  ConsentPreferences,
  "analytics" | "functionality" | "personalization" | "marketing"
>;

const CONSENT_OPTIONS: Array<{
  key: ConsentCategory;
  title: string;
  description: string;
  readonly?: boolean;
}> = [
  {
    key: "necessary",
    title: "Niezbędne",
    description:
      "Zapewniają bezpieczeństwo, zapis sesji i podstawowe działanie strony. Te zgody są zawsze aktywne.",
    readonly: true,
  },
  {
    key: "analytics",
    title: "Analityczne",
    description:
      "Pozwalają mierzyć ruch, zachowania użytkowników i skuteczność treści w Google Analytics 4.",
  },
  {
    key: "functionality",
    title: "Funkcjonalne",
    description:
      "Zapamiętują preferencje interfejsu i pomagają utrzymać wygodne działanie dodatkowych funkcji strony.",
  },
  {
    key: "personalization",
    title: "Personalizacja",
    description:
      "Umożliwiają dopasowanie treści i doświadczenia do Twoich wcześniejszych wyborów.",
  },
  {
    key: "marketing",
    title: "Marketingowe",
    description:
      "Pozwalają na remarketing, sygnały reklamowe i bardziej precyzyjne mierzenie kampanii.",
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
  const {
    consent,
    hasStoredConsent,
    isReady,
    isSettingsOpen,
    openSettings,
    closeSettings,
    acceptAll,
    rejectOptional,
    savePreferences,
  } = useConsent();
  const [draft, setDraft] = useState<ConsentDraft>(() => toDraft(consent));

  useEffect(() => {
    setDraft(toDraft(consent));
  }, [consent]);

  const hasAnyOptionalConsent = useMemo(
    () => Object.values(draft).some(Boolean),
    [draft],
  );

  if (!isReady) {
    return null;
  }

  const showBanner = !hasStoredConsent || isSettingsOpen;

  const handleToggle = (key: keyof ConsentDraft) => {
    setDraft((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const handleSave = () => {
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
          onClick={openSettings}
          aria-label="Otwórz ustawienia cookies"
        >
          Ustawienia cookies
        </button>
      ) : null}

      {showBanner ? (
        <div className="cookie-consent-shell" role="dialog" aria-modal="false">
          <section className="cookie-consent-banner" aria-label="Ustawienia zgód cookies">
            <div className="cookie-consent-banner__intro">
              <span className="cookie-consent-banner__eyebrow">Consent Mode v2</span>
              <h2>Skonfiguruj zgody cookies</h2>
              <p>
                Używamy plików cookies do działania serwisu, analityki i ewentualnych
                działań marketingowych. Możesz zaakceptować wszystko albo osobno
                włączyć wybrane kategorie zgód.
              </p>
            </div>

            <div className="cookie-consent-grid">
              {CONSENT_OPTIONS.map((option) => {
                const isReadonly = option.readonly;
                const isEnabled =
                  option.key === "necessary" ? true : draft[option.key as keyof ConsentDraft];

                return (
                  <article className="cookie-consent-card" key={option.key}>
                    <div className="cookie-consent-card__header">
                      <div>
                        <h3>{option.title}</h3>
                        <p>{option.description}</p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isEnabled}
                        aria-label={`${isEnabled ? "Wyłącz" : "Włącz"} zgody ${getConsentCategoryLabel(option.key).toLowerCase()}`}
                        className={`cookie-toggle${isEnabled ? " is-active" : ""}`}
                        onClick={
                          isReadonly
                            ? undefined
                            : () => handleToggle(option.key as keyof ConsentDraft)
                        }
                        disabled={isReadonly}
                      >
                        <span className="cookie-toggle__track">
                          <span className="cookie-toggle__thumb" />
                        </span>
                        <span className="cookie-toggle__label">
                          {isReadonly
                            ? "Zawsze aktywne"
                            : isEnabled
                              ? "Włączone"
                              : "Wyłączone"}
                        </span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="cookie-consent-banner__footer">
              <p>
                Aktualny stan:
                {" "}
                {hasAnyOptionalConsent
                  ? "co najmniej jedna zgoda opcjonalna jest włączona."
                  : "wszystkie zgody opcjonalne są wyłączone."}
              </p>
              <div className="cookie-consent-banner__actions">
                {hasStoredConsent ? (
                  <button
                    type="button"
                    className="cookie-button cookie-button--ghost"
                    onClick={closeSettings}
                  >
                    Zamknij
                  </button>
                ) : null}
                <button
                  type="button"
                  className="cookie-button cookie-button--ghost"
                  onClick={rejectOptional}
                >
                  Odrzuć opcjonalne
                </button>
                <button
                  type="button"
                  className="cookie-button cookie-button--secondary"
                  onClick={handleSave}
                >
                  Zapisz ustawienia
                </button>
                <button
                  type="button"
                  className="cookie-button cookie-button--primary"
                  onClick={acceptAll}
                >
                  Zaakceptuj wszystkie
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
