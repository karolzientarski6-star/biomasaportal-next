const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;
const MIN_SCORE = 0.5;

type RecaptchaApiResponse = {
  success: boolean;
  score: number;
  action: string;
  "error-codes"?: string[];
};

type VerifyResult =
  | { ok: true; score: number }
  | { ok: false; error: string };

/**
 * Verify a reCAPTCHA v3 token server-side.
 * Returns ok:true if the token passes or if RECAPTCHA_SECRET_KEY is not set (dev mode).
 */
export async function verifyRecaptcha(
  token: string | null | undefined,
  expectedAction?: string,
): Promise<VerifyResult> {
  if (!RECAPTCHA_SECRET) {
    // Not configured — skip in dev/staging
    return { ok: true, score: 1 };
  }

  if (!token) {
    return { ok: false, error: "Brak tokenu reCAPTCHA. Odśwież stronę i spróbuj ponownie." };
  }

  let data: RecaptchaApiResponse;

  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: RECAPTCHA_SECRET, response: token }),
      cache: "no-store",
    });
    data = (await res.json()) as RecaptchaApiResponse;
  } catch {
    // Network error — fail open to avoid blocking legit users
    return { ok: true, score: 0.5 };
  }

  if (!data.success) {
    return { ok: false, error: "Weryfikacja reCAPTCHA nie powiodła się. Spróbuj ponownie." };
  }

  if (data.score < MIN_SCORE) {
    return { ok: false, error: "Aktywność wygląda podejrzanie (bot). Spróbuj ponownie." };
  }

  if (expectedAction && data.action !== expectedAction) {
    return { ok: false, error: "Nieprawidłowy kontekst reCAPTCHA." };
  }

  return { ok: true, score: data.score };
}
