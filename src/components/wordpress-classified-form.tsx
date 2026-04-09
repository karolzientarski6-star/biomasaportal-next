"use client";

import { useActionState } from "react";
import { createClassifiedAction } from "@/app/actions/classifieds";

type WordPressClassifiedFormProps = {
  categories: Array<{
    id: number;
    name: string;
  }>;
};

export function WordPressClassifiedForm({
  categories,
}: WordPressClassifiedFormProps) {
  const [state, action, pending] = useActionState(createClassifiedAction, {});

  return (
    <form
      id="biomasa-ogloszenie-form"
      action={action}
      encType="multipart/form-data"
    >
      <div className="form-section">
        <h3 className="section-title">Podstawowe informacje</h3>

        <div className="form-group">
          <label htmlFor="ogloszenie_tytul">Tytuł ogłoszenia *</label>
          <input
            type="text"
            id="ogloszenie_tytul"
            name="tytul"
            required
            placeholder="np. 100mp zrębki tartacznej"
          />
        </div>

        <div className="form-group">
          <label htmlFor="ogloszenie_kategoria">Kategoria *</label>
          <select
            id="ogloszenie_kategoria"
            name="kategoria"
            defaultValue=""
            required
          >
            <option value="">Wybierz kategorię</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="ogloszenie_opis">Opis *</label>
          <textarea
            id="ogloszenie_opis"
            name="opis"
            rows={8}
            required
            placeholder="Opisz szczegółowo swoją ofertę..."
          />
          <small>Dokładny opis zwiększy szansę na sprzedaż</small>
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">Szczegóły oferty</h3>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="ogloszenie_cena">Cena (PLN)</label>
            <input
              type="number"
              id="ogloszenie_cena"
              name="cena"
              step="0.01"
              placeholder="np. 450"
            />
          </div>

          <div className="form-group">
            <label htmlFor="ogloszenie_lokalizacja">Lokalizacja</label>
            <input
              type="text"
              id="ogloszenie_lokalizacja"
              name="lokalizacja"
              placeholder="np. Poznań"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">Dane kontaktowe</h3>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="ogloszenie_telefon">Telefon kontaktowy</label>
            <input
              type="tel"
              id="ogloszenie_telefon"
              name="telefon"
              placeholder="np. 123 456 789"
            />
          </div>

          <div className="form-group">
            <label htmlFor="ogloszenie_email">Email kontaktowy *</label>
            <input
              type="email"
              id="ogloszenie_email"
              name="email"
              required
              placeholder="twoj@email.pl"
            />
            <small>
              Na ten adres otrzymasz powiadomienie o statusie ogłoszenia
            </small>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">Zdjęcia</h3>

        <div className="form-group">
          <label htmlFor="ogloszenie_zdjecia">Dodaj zdjęcia (max 10)</label>
          <input
            type="file"
            id="ogloszenie_zdjecia"
            name="zdjecia"
            multiple
            accept="image/*"
            disabled
          />
          <small>Upload zdjęć dopinam w kolejnym kroku pod Supabase Storage</small>
        </div>
      </div>

      <div className="form-section pricing-section">
        <div className="pricing-options">
          <label className="pricing-option">
            <input
              type="radio"
              name="account_option"
              value="with_account"
              defaultChecked
            />
            <div className="option-card">
              <div className="option-badge">Polecane</div>
              <div className="option-title">Z kontem użytkownika</div>
              <div className="option-price">
                <span className="price-big">DARMOWE</span>
                <span className="price-period">30 dni</span>
              </div>
              <div className="option-features">
                <div className="feature">✓ Panel zarządzania</div>
                <div className="feature">✓ Edycja ogłoszenia</div>
                <div className="feature">✓ Statystyki wyświetleń</div>
                <div className="feature">✓ Historia ogłoszeń</div>
              </div>
            </div>
          </label>

          <label className="pricing-option">
            <input type="radio" name="account_option" value="without_account" />
            <div className="option-card">
              <div className="option-title">Bez konta</div>
              <div className="option-price">
                <span className="price-big">19,99 PLN</span>
                <span className="price-vat">+ VAT (23%)</span>
                <span className="price-total">24,59 PLN</span>
                <span className="price-period">30 dni</span>
              </div>
              <div className="option-features">
                <div className="feature">✓ Jednorazowa publikacja</div>
                <div className="feature">✓ Brak dostępu do panelu</div>
              </div>
            </div>
          </label>
        </div>
      </div>

      <div className="form-section">
        <div className="featured-option">
          <label className="featured-toggle">
            <input
              type="checkbox"
              name="featured"
              id="featured_checkbox"
              value="1"
            />
            <span className="toggle-box"></span>
            <div className="toggle-content">
              <span className="toggle-title">Wyróżnij ogłoszenie</span>
              <span className="toggle-description">
                Twoje ogłoszenie będzie wyświetlane na samej górze listy
              </span>
              <span className="toggle-price">
                +15,00 PLN + VAT (18,45 PLN razem)
              </span>
            </div>
          </label>
        </div>
      </div>

      <div className="form-section">
        <div className="info-box">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle
              cx="10"
              cy="10"
              r="8"
              stroke="currentColor"
              strokeWidth="1.5"
            ></circle>
            <path
              d="M10 6v4M10 13h.01"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            ></path>
          </svg>
          <p>
            Twoje ogłoszenie zostanie zweryfikowane przez administratora w ciągu
            24 godzin. Otrzymasz powiadomienie email o statusie publikacji.
          </p>
        </div>

        {state.error ? (
          <div id="form-message" className="biomasa-form-message is-error">
            {state.error}
          </div>
        ) : null}
        {state.success ? (
          <div id="form-message" className="biomasa-form-message is-success">
            {state.success}
          </div>
        ) : null}

        <button type="submit" className="btn-submit" disabled={pending}>
          <span className="btn-text">
            {pending ? "Zapisywanie..." : "Dodaj ogłoszenie"}
          </span>
          <span className="btn-price" id="submit-price">
            DARMOWE
          </span>
        </button>

        <p className="recaptcha-info">
          Ta strona jest chroniona przez reCAPTCHA. Obowiązują{" "}
          <a href="https://policies.google.com/privacy" target="_blank">
            Polityka prywatności
          </a>{" "}
          i{" "}
          <a href="https://policies.google.com/terms" target="_blank">
            Warunki korzystania z usługi
          </a>{" "}
          Google.
        </p>
      </div>
    </form>
  );
}
