"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import {
  DEFAULT_GA_MEASUREMENT_ID,
  trackEvent,
  trackPageView,
} from "@/lib/analytics";
import {
  CONSENT_COOKIE_NAME,
  CONSENT_STORAGE_KEY,
  createConsentPreferences,
  toGoogleConsentState,
} from "@/lib/consent";

type AnalyticsProviderProps = {
  measurementId?: string;
};

type SiteSearchDetail = {
  path?: string;
  query?: string;
  resultsCount?: number;
  totalResults?: number;
};

type ConsentUpdateDetail = {
  analytics?: boolean;
};

const FILE_DOWNLOAD_PATTERN =
  /\.(pdf|doc|docx|xls|xlsx|csv|zip|rar|7z|mp3|mp4|ppt|pptx)$/i;
const SCROLL_MILESTONES = [25, 50, 75, 90, 100];

function normalizeLabel(value?: string | null) {
  return value?.replace(/\s+/g, " ").trim() || "";
}

function getInteractiveLabel(element: Element | null) {
  if (!element) {
    return "";
  }

  const ariaLabel = normalizeLabel(element.getAttribute("aria-label"));
  if (ariaLabel) {
    return ariaLabel;
  }

  const title = normalizeLabel(element.getAttribute("title"));
  if (title) {
    return title;
  }

  if ("value" in element && typeof element.value === "string") {
    const value = normalizeLabel(element.value);
    if (value) {
      return value;
    }
  }

  return normalizeLabel(element.textContent);
}

function getCanonicalPath(pathname: string, searchParams: URLSearchParams) {
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function isInternalUrl(url: URL) {
  return url.origin === window.location.origin;
}

function inferFormType(form: HTMLFormElement) {
  const analyticsForm = form.dataset.analyticsForm;
  if (analyticsForm) {
    return analyticsForm;
  }

  if (form.querySelector("input[name='s'], input[type='search']")) {
    return "search";
  }

  if (form.querySelector("input[name='passwordConfirm']")) {
    return "sign_up";
  }

  if (form.querySelector("input[name='password']")) {
    return "login";
  }

  if (form.id.includes("ogloszenie")) {
    return "classified_submission";
  }

  return "form";
}

function getItemListName(pathname: string) {
  if (pathname.startsWith("/wpisy")) {
    return "wpisy_blogowe";
  }

  if (pathname.startsWith("/ogloszenia")) {
    return "ogloszenia";
  }

  if (pathname.startsWith("/shop") || pathname.startsWith("/product")) {
    return "produkty";
  }

  return "lista";
}

function collectListItems(pathname: string) {
  const selectors = Array.from(
    document.querySelectorAll<HTMLElement>(
      ".elementor-widget-posts .elementor-post, .classified-card, li.product, .product",
    ),
  )
    .slice(0, 12)
    .map((element, index) => {
      const link = element.querySelector<HTMLAnchorElement>("a[href]");
      const title = getInteractiveLabel(
        element.querySelector(".elementor-post__title, .woocommerce-loop-product__title, h2, h3"),
      );

      return {
        item_id: link?.getAttribute("href") || `${pathname}#item-${index + 1}`,
        item_name: title || `Pozycja ${index + 1}`,
        index: index + 1,
      };
    })
    .filter((item) => item.item_name);

  return selectors;
}

function inferPageType(pathname: string) {
  const bodyClass = document.body.className;

  if (bodyClass.includes("single-post")) {
    return "single_post";
  }

  if (bodyClass.includes("single-product")) {
    return "single_product";
  }

  if (bodyClass.includes("single-ogloszenie")) {
    return "single_classified";
  }

  if (pathname.startsWith("/wpisy")) {
    return "blog_archive";
  }

  if (pathname.startsWith("/ogloszenia")) {
    return "classified_archive";
  }

  return "page";
}

function trackPageSpecificEvents(pathname: string, measurementId: string) {
  const pageType = inferPageType(pathname);
  const title = normalizeLabel(document.title);

  if (
    pageType === "single_post" ||
    pageType === "single_product" ||
    pageType === "single_classified"
  ) {
    trackEvent(
      "view_item",
      {
        page_type: pageType,
        item_id: pathname,
        item_name: title,
        item_category:
          pageType === "single_post"
            ? "blog"
            : pageType === "single_product"
              ? "produkt"
              : "ogloszenie",
      },
      measurementId,
    );
    return;
  }

  const items = collectListItems(pathname);
  if (items.length > 0) {
    trackEvent(
      "view_item_list",
      {
        page_type: pageType,
        item_list_id: getItemListName(pathname),
        item_list_name: getItemListName(pathname),
        items,
      },
      measurementId,
    );
  }
}

function getConsentBootstrapScript() {
  const defaultConsent = JSON.stringify(
    toGoogleConsentState(createConsentPreferences(), "default"),
  );
  const storageKey = JSON.stringify(CONSENT_STORAGE_KEY);
  const cookieName = JSON.stringify(CONSENT_COOKIE_NAME);

  return `
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
    (function() {
      var storageKey = ${storageKey};
      var cookieName = ${cookieName};
      function createConsent(base) {
        return {
          necessary: true,
          analytics: !!(base && base.analytics),
          functionality: !!(base && base.functionality),
          personalization: !!(base && base.personalization),
          marketing: !!(base && base.marketing),
          updatedAt: base && typeof base.updatedAt === "string" ? base.updatedAt : new Date().toISOString(),
          source: base && typeof base.source === "string" ? base.source : "stored"
        };
      }
      function parseStored(value) {
        if (!value) return null;
        try {
          return createConsent(JSON.parse(value));
        } catch (error) {
          return null;
        }
      }
      function readCookie(name) {
        var match = document.cookie
          .split(";")
          .map(function(entry) { return entry.trim(); })
          .find(function(entry) { return entry.indexOf(name + "=") === 0; });
        if (!match) return null;
        try {
          return decodeURIComponent(match.slice(name.length + 1));
        } catch (error) {
          return match.slice(name.length + 1);
        }
      }
      function readLocalStorage(name) {
        try {
          return window.localStorage.getItem(name);
        } catch (error) {
          return null;
        }
      }
      function toGoogleState(preferences) {
        return {
          ad_storage: preferences.marketing ? "granted" : "denied",
          ad_user_data: preferences.marketing ? "granted" : "denied",
          ad_personalization: preferences.marketing ? "granted" : "denied",
          analytics_storage: preferences.analytics ? "granted" : "denied",
          functionality_storage: preferences.functionality ? "granted" : "denied",
          personalization_storage: preferences.personalization ? "granted" : "denied",
          security_storage: "granted"
        };
      }
      var localConsent = parseStored(readLocalStorage(storageKey));
      var cookieConsent = parseStored(readCookie(cookieName));
      var storedConsent = localConsent || cookieConsent;
      var consent = storedConsent || createConsent();
      window.__biomasaConsent = consent;
      window.__biomasaConsentPersisted = !!storedConsent;
      window.gtag("consent", "default", ${defaultConsent});
      if (storedConsent) {
        window.gtag("consent", "update", toGoogleState(consent));
      }
    })();
  `;
}

export function AnalyticsProvider({
  measurementId = DEFAULT_GA_MEASUREMENT_ID,
}: AnalyticsProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const canonicalPath = useMemo(
    () => getCanonicalPath(pathname || "/", new URLSearchParams(searchParams?.toString())),
    [pathname, searchParams],
  );
  const trackedMilestonesRef = useRef<Set<number>>(new Set());
  const trackedPageEventsRef = useRef<string>("");

  useEffect(() => {
    trackedMilestonesRef.current = new Set();
    trackPageView(canonicalPath, measurementId);

    const timer = window.setTimeout(() => {
      if (trackedPageEventsRef.current === canonicalPath) {
        return;
      }

      trackedPageEventsRef.current = canonicalPath;
      trackPageSpecificEvents(pathname || "/", measurementId);
    }, 250);

    return () => {
      window.clearTimeout(timer);
    };
  }, [canonicalPath, measurementId, pathname]);

  useEffect(() => {
    const onScroll = () => {
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        scrollHeight <= 0 ? 100 : Math.min(100, Math.round((window.scrollY / scrollHeight) * 100));

      for (const milestone of SCROLL_MILESTONES) {
        if (progress >= milestone && !trackedMilestonesRef.current.has(milestone)) {
          trackedMilestonesRef.current.add(milestone);
          trackEvent(
            "scroll_depth",
            {
              page_path: canonicalPath,
              percent_scrolled: milestone,
            },
            measurementId,
          );
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [canonicalPath, measurementId]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const interactive = target?.closest("a, button, [role='button']");

      if (!interactive) {
        return;
      }

      const label = getInteractiveLabel(interactive);

      if (interactive instanceof HTMLAnchorElement) {
        const rawHref = interactive.getAttribute("href");
        if (!rawHref) {
          return;
        }

        if (rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) {
          trackEvent(
            "contact_click",
            {
              contact_type: rawHref.startsWith("mailto:") ? "email" : "phone",
              contact_target: rawHref.replace(/^(mailto:|tel:)/, ""),
              link_text: label,
              page_path: canonicalPath,
            },
            measurementId,
          );
          return;
        }

        let url: URL;
        try {
          url = new URL(rawHref, window.location.origin);
        } catch {
          return;
        }

        if (!isInternalUrl(url)) {
          trackEvent(
            "click_outbound",
            {
              link_url: url.toString(),
              link_domain: url.hostname,
              link_text: label,
              page_path: canonicalPath,
            },
            measurementId,
          );
          return;
        }

        if (FILE_DOWNLOAD_PATTERN.test(url.pathname)) {
          trackEvent(
            "file_download",
            {
              file_name: url.pathname.split("/").pop(),
              link_url: url.toString(),
              link_text: label,
              page_path: canonicalPath,
            },
            measurementId,
          );
        }

        if (interactive.closest(".elementor-widget-table-of-contents")) {
          trackEvent(
            "select_content",
            {
              content_type: "table_of_contents",
              item_id: url.hash || url.pathname,
              item_name: label,
              page_path: canonicalPath,
            },
            measurementId,
          );
          return;
        }

        const itemCard = interactive.closest(
          ".elementor-post, .classified-card, li.product, .product",
        );

        if (itemCard) {
          trackEvent(
            "select_item",
            {
              item_list_name: getItemListName(pathname || "/"),
              item_id: url.pathname,
              item_name: label,
              page_path: canonicalPath,
            },
            measurementId,
          );
          return;
        }

        if (
          interactive.classList.contains("elementor-button") ||
          interactive.classList.contains("primary-button") ||
          interactive.classList.contains("secondary-button") ||
          interactive.classList.contains("btn-submit") ||
          interactive.classList.contains("elementor-post__read-more")
        ) {
          trackEvent(
            "select_content",
            {
              content_type: "cta",
              item_name: label,
              link_url: url.pathname,
              page_path: canonicalPath,
            },
            measurementId,
          );
        }
        return;
      }

      trackEvent(
        "cta_click",
        {
          button_text: label,
          page_path: canonicalPath,
        },
        measurementId,
      );
    };

    const onSubmit = (event: SubmitEvent) => {
      const form = event.target instanceof HTMLFormElement ? event.target : null;
      if (!form) {
        return;
      }

      const formType = inferFormType(form);
      const formLabel =
        form.dataset.analyticsLabel ||
        normalizeLabel(
          form.querySelector("button, input[type='submit']")?.textContent ||
            form.querySelector("button, input[type='submit']")?.getAttribute("value"),
        ) ||
        form.id ||
        form.getAttribute("action") ||
        formType;

      trackEvent(
        "form_submit",
        {
          form_type: formType,
          form_id: form.id || undefined,
          form_label: formLabel,
          page_path: canonicalPath,
        },
        measurementId,
      );

      if (formType === "login") {
        trackEvent(
          "login",
          {
            method: "password",
            page_path: canonicalPath,
          },
          measurementId,
        );
      }

      if (formType === "sign_up") {
        trackEvent(
          "sign_up",
          {
            method: "email",
            page_path: canonicalPath,
          },
          measurementId,
        );
      }

      if (formType === "classified_submission") {
        trackEvent(
          "generate_lead",
          {
            lead_type: "classified_submission",
            page_path: canonicalPath,
          },
          measurementId,
        );
      }
    };

    const onSiteSearch = (event: Event) => {
      const customEvent = event as CustomEvent<SiteSearchDetail>;
      const query = normalizeLabel(customEvent.detail?.query);
      const totalResults = customEvent.detail?.totalResults ?? customEvent.detail?.resultsCount ?? 0;

      if (!query) {
        return;
      }

      trackEvent(
        "search",
        {
          search_term: query,
          results_count: totalResults,
          page_path: customEvent.detail?.path || canonicalPath,
        },
        measurementId,
      );

      trackEvent(
        "view_search_results",
        {
          search_term: query,
          results_count: totalResults,
          page_path: customEvent.detail?.path || canonicalPath,
        },
        measurementId,
      );
    };

    const onFaqToggle = (event: Event) => {
      const customEvent = event as CustomEvent<{ question?: string; expanded?: boolean }>;
      trackEvent(
        "faq_toggle",
        {
          question: customEvent.detail?.question,
          expanded: customEvent.detail?.expanded,
          page_path: canonicalPath,
        },
        measurementId,
      );
    };

    const onTransitionComplete = () => {
      trackEvent(
        "page_transition_complete",
        {
          page_path: canonicalPath,
        },
        measurementId,
      );
    };

    const onConsentUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<ConsentUpdateDetail>;
      if (!customEvent.detail?.analytics) {
        return;
      }

      trackedMilestonesRef.current = new Set();
      trackedPageEventsRef.current = "";
      trackPageView(canonicalPath, measurementId);
      window.setTimeout(() => {
        trackPageSpecificEvents(pathname || "/", measurementId);
      }, 120);
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    window.addEventListener("biomasa:site-search", onSiteSearch as EventListener);
    window.addEventListener("biomasa:faq-toggle", onFaqToggle as EventListener);
    window.addEventListener(
      "biomasa:page-transition-complete",
      onTransitionComplete as EventListener,
    );
    window.addEventListener("biomasa:consent-updated", onConsentUpdated as EventListener);

    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
      window.removeEventListener("biomasa:site-search", onSiteSearch as EventListener);
      window.removeEventListener("biomasa:faq-toggle", onFaqToggle as EventListener);
      window.removeEventListener(
        "biomasa:page-transition-complete",
        onTransitionComplete as EventListener,
      );
      window.removeEventListener(
        "biomasa:consent-updated",
        onConsentUpdated as EventListener,
      );
    };
  }, [canonicalPath, measurementId, pathname]);

  return (
    <>
      <Script id="ga4-consent-default" strategy="beforeInteractive">
        {getConsentBootstrapScript()}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            send_page_view: false,
            allow_google_signals: true,
            allow_ad_personalization_signals: false
          });
        `}
      </Script>
    </>
  );
}
