"use client";

import { useActionState } from "react";
import { forgotPasswordAction } from "@/app/actions/auth";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, {});

  return (
    <form action={formAction} className="form-grid">
      <div className="form-field">
        <label htmlFor="forgot-email">Adres email</label>
        <input
          id="forgot-email"
          name="email"
          type="email"
          required
          placeholder="twoj@email.pl"
        />
      </div>

      {state.error ? (
        <div className="status-banner error">{state.error}</div>
      ) : null}
      {state.success ? (
        <div className="status-banner">{state.success}</div>
      ) : null}

      <button type="submit" className="primary-button" disabled={pending}>
        {pending ? "Wysyłam..." : "Wyślij link resetujący"}
      </button>
    </form>
  );
}
