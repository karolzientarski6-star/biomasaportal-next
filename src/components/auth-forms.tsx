"use client";

import { useActionState } from "react";
import { signInAction, signUpAction } from "@/app/actions/auth";

type SignUpFormProps = {
  origin: string;
};

export function SignUpForm({ origin }: SignUpFormProps) {
  const [state, action, pending] = useActionState(signUpAction, {});

  return (
    <form action={action} className="form-grid">
      <input type="hidden" name="origin" value={origin} />

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
  );
}

export function SignInForm() {
  const [state, action, pending] = useActionState(signInAction, {});

  return (
    <form action={action} className="form-grid">
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
  );
}
