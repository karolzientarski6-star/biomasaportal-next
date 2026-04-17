"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type PageTransitionProps = {
  children: React.ReactNode;
};

type FramerMotionModule = typeof import("framer-motion");

function scheduleMotionImport(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  if ("requestIdleCallback" in window) {
    const idleHandle = window.requestIdleCallback(callback, { timeout: 1400 });
    return () => window.cancelIdleCallback(idleHandle);
  }

  const timeout = globalThis.setTimeout(callback, 220);
  return () => globalThis.clearTimeout(timeout);
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [motionModule, setMotionModule] = useState<FramerMotionModule | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    return scheduleMotionImport(() => {
      void import("framer-motion").then((module) => {
        setMotionModule(module);
      });
    });
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("codex:aos-refresh"));
      window.dispatchEvent(new CustomEvent("biomasa:page-transition-complete"));
    }, motionModule ? 420 : 90);

    return () => {
      window.clearTimeout(timer);
    };
  }, [motionModule, pathname]);

  if (!motionModule) {
    return <div className="page-transition-shell">{children}</div>;
  }

  const { AnimatePresence, LazyMotion, domAnimation, m } = motionModule;

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={pathname}
          className="page-transition-shell"
          initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          <m.div
            className="page-transition-accent"
            initial={{ scaleX: 0, opacity: 0.9 }}
            animate={{ scaleX: 1, opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          />
          {children}
        </m.div>
      </AnimatePresence>
    </LazyMotion>
  );
}
