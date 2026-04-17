"use client";

import { useEffect } from "react";

type DeferredStylesheetLoaderProps = {
  hrefs: string[];
};

function scheduleDeferredLoad(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  if ("requestIdleCallback" in window) {
    const handle = window.requestIdleCallback(callback, { timeout: 1200 });
    return () => window.cancelIdleCallback(handle);
  }

  const timeout = globalThis.setTimeout(callback, 180);
  return () => globalThis.clearTimeout(timeout);
}

export function DeferredStylesheetLoader({
  hrefs,
}: DeferredStylesheetLoaderProps) {
  useEffect(() => {
    if (!hrefs.length) {
      return;
    }

    return scheduleDeferredLoad(() => {
      for (const href of hrefs) {
        const existing = document.head.querySelector<HTMLLinkElement>(
          `link[rel="stylesheet"][href="${CSS.escape(href)}"]`,
        );

        if (existing) {
          continue;
        }

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        link.dataset.codexDeferredStylesheet = "true";
        document.head.append(link);
      }
    });
  }, [hrefs]);

  return null;
}
