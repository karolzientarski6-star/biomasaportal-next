"use client";

import { useActionState } from "react";
import { updatePasswordAction } from "@/app/actions/auth";

export function NewPasswordForm() {
  const [state, formAction, pending] = useActionState(updatePasswordAction, {});

  return (
    <form action={formAction} className="form-grid">
      <div className="form-field">
        <label htmlFor="new-password">Nowe hasło</label>
        <input
          id="new-password"
          name="password"
          type="password"
          minLength={8}
          required
          placeholder="Min. 8 znaków"
        />
      </div>

      <div className="form-field">
        <label htmlFor="new-password-confirm">Potwierdź nowe hasło</label>
        <input
          id="new-password-confirm"
          name="passwordConfirm"
          type="password"
          minLength={8}
          required
          placeholder="Powtórz hasło"
        />
      </div>

      {state.error ? (
        <div className="status-banner error">{state.error}</div>
      ) : null}

      <button type="submit" className="primary-button" disabled={pending}>
        {pending ? "Zapisuję..." : "Ustaw nowe hasło"}
      </button>
    </form>
  );
}
