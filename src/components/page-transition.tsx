"use client";

import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

type PageTransitionProps = {
  children: React.ReactNode;
};

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("codex:aos-refresh"));
      window.dispatchEvent(new CustomEvent("biomasa:page-transition-complete"));
    }, 420);

    return () => {
      window.clearTimeout(timer);
    };
  }, [pathname]);

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
