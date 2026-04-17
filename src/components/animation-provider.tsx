"use client";

import { useEffect } from "react";

type AosModule = {
  init: (options?: Record<string, unknown>) => void;
  refreshHard: () => void;
};

declare global {
  interface Window {
    __codexAos?: AosModule;
  }
}

export function AnimationProvider() {
  useEffect(() => {
    let active = true;

    const handleRefresh = () => {
      window.__codexAos?.refreshHard();
    };

    const shouldLoadAos = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return false;
      }

      return Boolean(document.querySelector("[data-aos]"));
    };

    const scheduleImport = () => {
      if (!shouldLoadAos()) {
        return;
      }

      void import("aos").then(({ default: AOS }) => {
        if (!active) {
          return;
        }

        AOS.init({
          duration: 700,
          easing: "ease-out-cubic",
          once: true,
          offset: 48,
        });
        window.__codexAos = AOS;
        handleRefresh();
      });
    };

    let cleanupIdle: (() => void) | null = null;
    if ("requestIdleCallback" in window) {
      const idleHandle = window.requestIdleCallback(scheduleImport, {
        timeout: 1400,
      });
      cleanupIdle = () => window.cancelIdleCallback(idleHandle);
    } else {
      const timeout = globalThis.setTimeout(scheduleImport, 220);
      cleanupIdle = () => globalThis.clearTimeout(timeout);
    }

    window.addEventListener("codex:aos-refresh", handleRefresh);

    return () => {
      active = false;
      cleanupIdle?.();
      window.removeEventListener("codex:aos-refresh", handleRefresh);
    };
  }, []);

  return null;
}
