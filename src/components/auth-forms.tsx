"use client";

import { useActionState, startTransition } from "react";
import Script from "next/script";
import { signInAction, signUpAction } from "@/app/actions/auth";
import { getRecaptchaToken, RECAPTCHA_SITE_KEY } from "@/lib/recaptcha-client";

type SignUpFormProps = {
  origin: string;
};

export function SignUpForm({ origin }: SignUpFormProps) {
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
      <form
        onSubmit={handleSubmit}
        className="form-grid"
        data-analytics-form="sign_up"
        data-analytics-label="Rejestracja"
      >
        <input type="hidden" name="origin" value={origin} />
        <input type="hidden" name="terms" value="accepted" />

        <div className="form-field">
          <label htmlFor="register-email">Adres email</label>
          <input id="register-email" name="email" type="email" required />
        </div>

        <div className="two-col">
          <div className="form-field">
            <label htmlFor="register-password">Hasło</label>
            <input
              id="register-password"
              name="password"
              type="password"
              minLength={8}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="register-password-repeat">Potwierdź hasło</label>
            <input
              id="register-password-repeat"
              name="passwordConfirm"
              type="password"
              minLength={8}
              required
            />
          </div>
        </div>

        {state.error ? <div className="status-banner error">{state.error}</div> : null}
        {state.success ? <div className="status-banner">{state.success}</div> : null}

        <button type="submit" className="primary-button" disabled={pending}>
          {pending ? "Tworzę konto..." : "Załóż konto"}
        </button>
      </form>
    </>
  );
}

export function SignInForm() {
  const [state, formAction, pending] = useActionState(signInAction, {});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const token = await getRecaptchaToken("login");
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
      <form
        onSubmit={handleSubmit}
        className="form-grid"
        data-analytics-form="login"
        data-analytics-label="Logowanie"
      >
        <div className="form-field">
          <label htmlFor="login-email">Adres email</label>
          <input id="login-email" name="email" type="email" required />
        </div>

        <div className="form-field">
          <label htmlFor="login-password">Hasło</label>
          <input
            id="login-password"
            name="password"
            type="password"
            minLength={8}
            required
          />
        </div>

        {state.error ? <div className="status-banner error">{state.error}</div> : null}

        <button type="submit" className="primary-button" disabled={pending}>
          {pending ? "Logowanie..." : "Zaloguj się"}
        </button>
      </form>
    </>
  );
}
