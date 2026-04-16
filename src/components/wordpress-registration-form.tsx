"use client";

import { useActionState, startTransition } from "react";
import Script from "next/script";
import { signUpAction } from "@/app/actions/auth";
import { getRecaptchaToken, RECAPTCHA_SITE_KEY } from "@/lib/recaptcha-client";

type WordPressRegistrationFormProps = {
  origin: string;
};

export function WordPressRegistrationForm({
  origin,
}: WordPressRegistrationFormProps) {
  const [state, formAction, pending] = useActionState(signUpAction, {});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const token = await getRecaptchaToken("signup");
    formData.set("recaptcha_token", token);
    startTransition(() => { formAction(formData); });
  }

  return (
    <>
    {RECAPTCHA_SITE_KEY && (
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
        strategy="lazyOnload"
      />
    )}
    <form id="biomasa-registration-form" onSubmit={handleSubmit}>
      <input type="hidden" name="origin" value={origin} />

      <div className="form-section">
        <div className="form-group">
          <label htmlFor="register_email">Adres email *</label>
          <input
            type="email"
            id="register_email"
            name="email"
            required
            placeholder="twoj@email.pl"
          />
          <small>Na ten adres wyślemy link aktywacyjny</small>
        </div>

        <div className="form-group">
          <label htmlFor="register_password">Hasło *</label>
          <input
            type="password"
            id="register_password"
            name="password"
            required
            minLength={8}
            placeholder="Min. 8 znaków"
          />
          <small>Minimum 8 znaków</small>
        </div>

        <div className="form-group">
          <label htmlFor="register_password_confirm">Potwierdź hasło *</label>
          <input
            type="password"
            id="register_password_confirm"
            name="password_confirm"
            required
            minLength={8}
            placeholder="Powtórz hasło"
          />
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input type="checkbox" name="terms" value="accepted" required />
            <span>
              Akceptuję <a href="/polityka-prywatnosci/">Politykę Prywatności</a>{" "}
              i <a href="/regulamin/">Regulamin</a>
            </span>
          </label>
        </div>

        <div className="benefits-box">
          <h3>Co zyskujesz?</h3>
          <ul>
            <li>✓ Darmowe dodawanie ogłoszeń (30 dni)</li>
            <li>✓ Panel zarządzania ogłoszeniami</li>
            <li>✓ Statystyki wyświetleń</li>
            <li>✓ Możliwość edycji i przedłużania</li>
          </ul>
        </div>

        {state.error ? (
          <div id="register-message" className="biomasa-form-message is-error">
            {state.error}
          </div>
        ) : null}
        {state.success ? (
          <div id="register-message" className="biomasa-form-message is-success">
            {state.success}
          </div>
        ) : null}

        <button type="submit" className="btn-register" disabled={pending}>
          {pending ? "Zakładanie konta..." : "Załóż konto"}
        </button>

        <p className="recaptcha-info">
          Ta strona jest chroniona przez reCAPTCHA. Obowiązują{" "}
          <a href="https://policies.google.com/privacy" target="_blank">
            Polityka prywatności
          </a>{" "}
          i{" "}
          <a href="https://policies.google.com/terms" target="_blank">
            Warunki korzystania
          </a>{" "}
          Google.
        </p>
      </div>
    </form>
    </>
  );
}
