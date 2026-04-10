export const DEFAULT_GA_MEASUREMENT_ID = "G-RGSK5S613J";

type AnalyticsPrimitive = string | number | boolean | null | undefined;
type AnalyticsValue =
  | AnalyticsPrimitive
  | AnalyticsPrimitive[]
  | Record<string, AnalyticsPrimitive>[]
  | Record<string, AnalyticsPrimitive>;

export type AnalyticsEventParams = Record<string, AnalyticsValue>;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function sanitizeEventParams(params: AnalyticsEventParams) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (value === null || value === undefined || value === "") {
        return false;
      }

      if (Array.isArray(value)) {
        return value.length > 0;
      }

      return true;
    }),
  );
}

export function getGaMeasurementId() {
  return process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || DEFAULT_GA_MEASUREMENT_ID;
}

export function canTrackAnalytics(measurementId?: string | null) {
  return Boolean(
    measurementId &&
      typeof window !== "undefined" &&
      typeof window.gtag === "function",
  );
}

export function trackEvent(
  name: string,
  params: AnalyticsEventParams = {},
  measurementId = getGaMeasurementId(),
) {
  if (!canTrackAnalytics(measurementId)) {
    return;
  }

  window.gtag?.("event", name, {
    send_to: measurementId,
    ...sanitizeEventParams(params),
  });
}

export function trackPageView(
  path: string,
  measurementId = getGaMeasurementId(),
) {
  if (!canTrackAnalytics(measurementId)) {
    return;
  }

  window.gtag?.("event", "page_view", {
    send_to: measurementId,
    page_title: document.title,
    page_location: window.location.href,
    page_path: path,
    page_referrer: document.referrer || undefined,
  });
}
