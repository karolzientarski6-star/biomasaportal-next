declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

export const RECAPTCHA_SITE_KEY =
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

/** Execute reCAPTCHA v3 and return the token. Returns "" if not configured. */
export function getRecaptchaToken(action: string): Promise<string> {
  return new Promise((resolve) => {
    if (
      !RECAPTCHA_SITE_KEY ||
      typeof window === "undefined" ||
      !window.grecaptcha
    ) {
      resolve("");
      return;
    }

    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(RECAPTCHA_SITE_KEY, { action })
        .then(resolve)
        .catch(() => resolve(""));
    });
  });
}
