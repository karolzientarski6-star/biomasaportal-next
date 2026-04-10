export const CONSENT_STORAGE_KEY = "biomasa_cookie_consent_v1";
export const CONSENT_COOKIE_NAME = CONSENT_STORAGE_KEY;
export const CONSENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

export type ConsentCategory =
  | "necessary"
  | "analytics"
  | "functionality"
  | "personalization"
  | "marketing";

export type ConsentSource =
  | "default"
  | "accept_all"
  | "reject_optional"
  | "save_preferences"
  | "stored";

export type ConsentPreferences = {
  necessary: true;
  analytics: boolean;
  functionality: boolean;
  personalization: boolean;
  marketing: boolean;
  updatedAt: string;
  source: ConsentSource;
};

type PartialConsentPreferences = Partial<
  Omit<ConsentPreferences, "necessary" | "updatedAt" | "source">
> & {
  updatedAt?: string;
  source?: ConsentSource;
};

export type GoogleConsentState = {
  ad_storage: "granted" | "denied";
  ad_user_data: "granted" | "denied";
  ad_personalization: "granted" | "denied";
  analytics_storage: "granted" | "denied";
  functionality_storage: "granted" | "denied";
  personalization_storage: "granted" | "denied";
  security_storage: "granted" | "denied";
  wait_for_update?: number;
};

export function createConsentPreferences(
  overrides: PartialConsentPreferences = {},
): ConsentPreferences {
  return {
    necessary: true,
    analytics: overrides.analytics ?? false,
    functionality: overrides.functionality ?? false,
    personalization: overrides.personalization ?? false,
    marketing: overrides.marketing ?? false,
    updatedAt: overrides.updatedAt || new Date().toISOString(),
    source: overrides.source || "default",
  };
}

export function acceptAllConsent(source: ConsentSource = "accept_all") {
  return createConsentPreferences({
    analytics: true,
    functionality: true,
    personalization: true,
    marketing: true,
    source,
  });
}

export function rejectOptionalConsent(source: ConsentSource = "reject_optional") {
  return createConsentPreferences({ source });
}

export function sanitizeConsentPreferences(value: unknown) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as PartialConsentPreferences;
  return createConsentPreferences({
    analytics: Boolean(candidate.analytics),
    functionality: Boolean(candidate.functionality),
    personalization: Boolean(candidate.personalization),
    marketing: Boolean(candidate.marketing),
    updatedAt:
      typeof candidate.updatedAt === "string" ? candidate.updatedAt : undefined,
    source:
      candidate.source &&
      ["default", "accept_all", "reject_optional", "save_preferences", "stored"].includes(
        candidate.source,
      )
        ? candidate.source
        : "stored",
  });
}

export function serializeConsentPreferences(preferences: ConsentPreferences) {
  return JSON.stringify(preferences);
}

export function deserializeConsentPreferences(serialized: string | null | undefined) {
  if (!serialized) {
    return null;
  }

  try {
    return sanitizeConsentPreferences(JSON.parse(serialized));
  } catch {
    return null;
  }
}

export function readConsentCookie(cookieHeader: string | null | undefined) {
  if (!cookieHeader) {
    return null;
  }

  const parts = cookieHeader
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean);
  const match = parts.find((entry) => entry.startsWith(`${CONSENT_COOKIE_NAME}=`));
  if (!match) {
    return null;
  }

  const rawValue = match.slice(CONSENT_COOKIE_NAME.length + 1);
  try {
    return decodeURIComponent(rawValue);
  } catch {
    return rawValue;
  }
}

export function toGoogleConsentState(
  preferences: ConsentPreferences,
  mode: "default" | "update" = "update",
): GoogleConsentState {
  const baseState: GoogleConsentState = {
    ad_storage: preferences.marketing ? "granted" : "denied",
    ad_user_data: preferences.marketing ? "granted" : "denied",
    ad_personalization: preferences.marketing ? "granted" : "denied",
    analytics_storage: preferences.analytics ? "granted" : "denied",
    functionality_storage: preferences.functionality ? "granted" : "denied",
    personalization_storage: preferences.personalization ? "granted" : "denied",
    security_storage: "granted",
  };

  if (mode === "default") {
    baseState.wait_for_update = 500;
  }

  return baseState;
}

export function getConsentCategoryLabel(category: ConsentCategory) {
  switch (category) {
    case "necessary":
      return "Niezbędne";
    case "analytics":
      return "Analityczne";
    case "functionality":
      return "Funkcjonalne";
    case "personalization":
      return "Personalizacja";
    case "marketing":
      return "Marketingowe";
    default:
      return category;
  }
}
