"use client";

import { useEffect } from "react";

type WordPressBodyClassProps = {
  className?: string;
};

export function WordPressBodyClass({
  className = "",
}: WordPressBodyClassProps) {
  useEffect(() => {
    const body = document.body;
    const previousClassName = body.className;
    const normalizedClassName = className
      .replace(/\bwoocommerce-no-js\b/g, "woocommerce-js")
      .trim();

    body.className = [normalizedClassName, "e--ua-blink", "e--ua-webkit"]
      .filter(Boolean)
      .join(" ");

    return () => {
      body.className = previousClassName;
    };
  }, [className]);

  return null;
}
