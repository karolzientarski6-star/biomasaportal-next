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

    window.addEventListener("codex:aos-refresh", handleRefresh);

    return () => {
      active = false;
      window.removeEventListener("codex:aos-refresh", handleRefresh);
    };
  }, []);

  return null;
}
