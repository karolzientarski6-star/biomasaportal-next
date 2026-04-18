import Link from "next/link";

export function NativePreviewFooter() {
  return (
    <footer className="native-site-footer">
      <div className="native-site-footer__inner">
        <div className="native-site-footer__top">
          <div className="native-site-footer__brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/wp-content/uploads/2024/01/biomasaportal.png"
              alt="Biomasa Portal"
              width={200}
              height={200}
              loading="lazy"
            />
          </div>

          <div className="native-site-footer__column">
            <h4>Oferta</h4>
            <ul>
              <li>
                <Link href="/ogloszenia/">Ogłoszenia</Link>
              </li>
              <li>
                <Link href="/biomasa-w-polsce/maszyny-lesne/">Sprzedaż maszyn leśnych</Link>
              </li>
            </ul>
          </div>

          <div className="native-site-footer__column">
            <h4>Skróty</h4>
            <ul>
              <li>
                <Link href="/polityka-prywatnosci/">Polityka prywatności</Link>
              </li>
              <li>
                <Link href="/zaloguj-sie/">Zaloguj się</Link>
              </li>
              <li>
                <Link href="/zaloz-konto/">Załóż konto</Link>
              </li>
              <li>
                <Link href="/moje-ogloszenia/">Moje ogłoszenia</Link>
              </li>
              <li>
                <Link href="/dodaj-ogloszenie/">Dodaj ogłoszenie</Link>
              </li>
              <li>
                <Link href="/regulamin/">Regulamin</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="native-site-footer__divider" />

        <div className="native-site-footer__middle">
          <div className="native-site-footer__column">
            <h4>Kontakt oraz reklama</h4>
            <ul>
              <li>
                <a href="tel:511430886">+48 511 430 886</a>
              </li>
              <li>
                <a href="mailto:kontakt@biomasaportal.pl">kontakt@biomasaportal.pl</a>
              </li>
              <li>Toruń</li>
            </ul>
          </div>

          <div className="native-site-footer__column native-site-footer__rights">
            <h4>
              Biomasa Portal
              <br />
              Wszelkie prawa zastrzeżone
            </h4>
          </div>
        </div>

        <div className="native-site-footer__bottom">
          <p>© 2026 Biomasa Portal</p>
          <p>
            <a href="https://maxdigital.pl">Właściciel serwisu: Max Digital – Efektywny Marketing</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
