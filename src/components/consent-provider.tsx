"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  acceptAllConsent,
  CONSENT_COOKIE_MAX_AGE,
  CONSENT_COOKIE_NAME,
  CONSENT_STORAGE_KEY,
  createConsentPreferences,
  deserializeConsentPreferences,
  readConsentCookie,
  rejectOptionalConsent,
  serializeConsentPreferences,
  toGoogleConsentState,
  type ConsentPreferences,
} from "@/lib/consent";

type ConsentContextValue = {
  consent: ConsentPreferences;
  hasStoredConsent: boolean;
  isReady: boolean;
  acceptAll: () => void;
  rejectOptional: () => void;
  savePreferences: (preferences: ConsentPreferences) => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

declare global {
  interface Window {
    __biomasaConsent?: ConsentPreferences;
    __biomasaConsentPersisted?: boolean;
  }
}

type ConsentProviderProps = {
  children: React.ReactNode;
};

function persistConsent(preferences: ConsentPreferences) {
  const serialized = serializeConsentPreferences(preferences);
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, serialized);
  } catch {
    // Ignore storage write failures; cookie remains the fallback source of truth.
  }
  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(serialized)}; path=/; max-age=${CONSENT_COOKIE_MAX_AGE}; SameSite=Lax; Secure`;
  window.__biomasaConsent = preferences;
  window.__biomasaConsentPersisted = true;
}

function syncGoogleConsent(preferences: ConsentPreferences) {
  const state = toGoogleConsentState(preferences, "update");
  window.gtag?.("consent", "update", state);
  window.dataLayer?.push({
    event: "biomasa_consent_update",
    biomasa_consent: preferences,
  });
}

function readStoredConsent() {
  let localStorageValue: string | null = null;
  try {
    localStorageValue = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  } catch {
    localStorageValue = null;
  }
  const localConsent = deserializeConsentPreferences(localStorageValue);
  if (localConsent) {
    return localConsent;
  }

  const cookieValue = readConsentCookie(document.cookie);
  return deserializeConsentPreferences(cookieValue);
}

export function ConsentProvider({ children }: ConsentProviderProps) {
  const [consent, setConsent] = useState<ConsentPreferences>(() =>
    createConsentPreferences(),
  );
  const [hasStoredConsent, setHasStoredConsent] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const persistedConsent = readStoredConsent();
    const hasPersistedConsent = Boolean(
      window.__biomasaConsentPersisted || persistedConsent,
    );
    const initialConsent =
      (hasPersistedConsent ? window.__biomasaConsent || persistedConsent : null) ||
      createConsentPreferences();

    setConsent(initialConsent);
    setHasStoredConsent(hasPersistedConsent);
    window.__biomasaConsentPersisted = hasPersistedConsent;
    window.__biomasaConsent = initialConsent;
    setIsReady(true);
  }, []);

  const applyConsent = useCallback(
    (preferences: ConsentPreferences) => {
      persistConsent(preferences);
      setConsent(preferences);
      setHasStoredConsent(true);
      syncGoogleConsent(preferences);
      window.dispatchEvent(
        new CustomEvent("biomasa:consent-updated", {
          detail: preferences,
        }),
      );
    },
    [],
  );

  const acceptAll = useCallback(() => {
    applyConsent(acceptAllConsent());
  }, [applyConsent]);

  const rejectOptional = useCallback(() => {
    applyConsent(rejectOptionalConsent());
  }, [applyConsent]);

  const savePreferences = useCallback(
    (preferences: ConsentPreferences) => {
      applyConsent(
        createConsentPreferences({
          analytics: preferences.analytics,
          functionality: preferences.functionality,
          personalization: preferences.personalization,
          marketing: preferences.marketing,
          source: "save_preferences",
        }),
      );
    },
    [applyConsent],
  );

  const value = useMemo<ConsentContextValue>(
    () => ({
      consent,
      hasStoredConsent,
      isReady,
      acceptAll,
      rejectOptional,
      savePreferences,
    }),
    [
      acceptAll,
      consent,
      isReady,
      rejectOptional,
      savePreferences,
    ],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error("useConsent must be used within ConsentProvider");
  }

  return context;
}
