"use client";

import { useActionState } from "react";
import { createClassifiedAction } from "@/app/actions/classifieds";

type ClassifiedFormPanelProps = {
  disabled?: boolean;
};

export function ClassifiedFormPanel({
  disabled = false,
}: ClassifiedFormPanelProps) {
  const [state, action, pending] = useActionState(createClassifiedAction, {});

  return (
    <form
      action={action}
      className="form-grid"
      data-analytics-form="classified_submission"
      data-analytics-label="Panel dodawania ogloszenia"
    >
      <div className="form-field">
        <label htmlFor="title">Tytuł ogłoszenia</label>
        <input
          id="title"
          name="title"
          placeholder="np. 100 mp zrębki tartacznej"
          required
          disabled={disabled}
        />
      </div>

      <div className="two-col">
        <div className="form-field">
          <label htmlFor="category">Kategoria</label>
          <select id="category" name="category" defaultValue="" required disabled={disabled}>
            <option value="" disabled>
              Wybierz kategorię
            </option>
            <option>PKS</option>
            <option>Pellet A1</option>
            <option>Zrębka tartaczna</option>
            <option>Maszyny leśne</option>
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="price">Cena</label>
          <input id="price" name="price" placeholder="np. 450" disabled={disabled} />
        </div>
      </div>

      <div className="two-col">
        <div className="form-field">
          <label htmlFor="location">Lokalizacja</label>
          <input id="location" name="location" placeholder="np. Poznań" disabled={disabled} />
        </div>
        <div className="form-field">
          <label htmlFor="phone">Telefon</label>
          <input id="phone" name="phone" placeholder="np. 123 456 789" disabled={disabled} />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="email">Email kontaktowy</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="twoj@email.pl"
          required
          disabled={disabled}
        />
      </div>

      <div className="form-field">
        <label htmlFor="description">Opis</label>
        <textarea
          id="description"
          name="description"
          placeholder="Opisz szczegółowo ofertę, parametry, ilości i warunki odbioru."
          required
          disabled={disabled}
        />
      </div>

      {state.error ? <div className="status-banner error">{state.error}</div> : null}
      {state.success ? <div className="status-banner">{state.success}</div> : null}

      <button type="submit" className="primary-button" disabled={disabled || pending}>
        {disabled
          ? "Najpierw skonfiguruj Supabase"
          : pending
            ? "Zapisuję..."
            : "Dodaj ogłoszenie"}
      </button>
    </form>
  );
}
