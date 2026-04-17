import Link from "next/link";
import { EDITORIAL_CATEGORIES } from "@/lib/editorial-categories";

function MegaMenu() {
  return (
    <li className="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children biomasa-mega-menu">
      <Link href="/biomasa-w-polsce/" className="elementor-item">
        Biomasa w Polsce
      </Link>
      <ul className="sub-menu elementor-nav-menu--dropdown biomasa-mega-menu__panel">
        {EDITORIAL_CATEGORIES.map((category) => (
          <li key={category.slug} className="menu-item biomasa-mega-menu__item">
            <Link
              href={`/biomasa-w-polsce/${category.slug}/`}
              className="elementor-sub-item biomasa-mega-menu__link"
              tabIndex={-1}
            >
              <span className="biomasa-mega-menu__eyebrow">{category.accentLabel}</span>
              <span className="biomasa-mega-menu__label">{category.name}</span>
              <span className="biomasa-mega-menu__copy">{category.shortDescription}</span>
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
}

export function NativePreviewHeader() {
  return (
    <header
      data-elementor-type="header"
      data-elementor-id="19"
      className="elementor elementor-19 elementor-location-header"
      data-elementor-post-type="elementor_library"
    >
      <div
        className="elementor-element elementor-element-a7a6507 e-flex e-con-boxed e-con e-parent"
        data-id="a7a6507"
        data-element_type="container"
        data-settings='{"background_background":"gradient","sticky":"top","sticky_on":["desktop","tablet","mobile"],"sticky_offset":0,"sticky_effects_offset":0,"sticky_anchor_link_offset":0}'
      >
        <div className="e-con-inner">
          <div
            className="elementor-element elementor-element-6afe1ec elementor-widget-mobile__width-initial elementor-widget elementor-widget-image"
            data-id="6afe1ec"
            data-element_type="widget"
            data-widget_type="image.default"
          >
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                width={200}
                height={200}
                src="/wp-content/uploads/2024/01/biomasaportal.png"
                className="attachment-full size-full wp-image-63"
                alt="biomasa portal"
                decoding="async"
                loading="eager"
                fetchPriority="high"
              />
            </Link>
          </div>

          <div
            className="elementor-element elementor-element-7c738ef elementor-widget elementor-widget-off-canvas"
            data-id="7c738ef"
            data-element_type="widget"
            data-settings='{"entrance_animation_mobile":"fadeInRight","exit_animation_mobile":"fadeInRight"}'
            data-widget_type="off-canvas.default"
          >
            <div
              id="off-canvas-native-preview"
              className="e-off-canvas"
              role="dialog"
              aria-hidden="true"
              aria-label="Menu"
              aria-modal={true}
              inert
              data-delay-child-handlers="true"
            >
              <div className="e-off-canvas__overlay" />
              <div className="e-off-canvas__main">
                <div className="e-off-canvas__content">
                  <div
                    className="elementor-element elementor-element-d1fefb1 e-con-full e-flex e-con e-child"
                    data-id="d1fefb1"
                    data-element_type="container"
                    data-settings='{"background_background":"classic"}'
                  >
                    <div
                      className="elementor-element elementor-element-7a83f10 e-flex e-con-boxed e-con e-child"
                      data-id="7a83f10"
                      data-element_type="container"
                    >
                      <div className="e-con-inner">
                        <div
                          className="elementor-element elementor-element-e793591 elementor-widget-mobile__width-initial elementor-widget elementor-widget-image"
                          data-id="e793591"
                          data-element_type="widget"
                          data-widget_type="image.default"
                        >
                          <Link href="/">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              width={200}
                              height={200}
                              src="/wp-content/uploads/2024/01/biomasaportal.png"
                              className="attachment-full size-full wp-image-63"
                              alt="biomasa portal"
                              decoding="async"
                              loading="lazy"
                            />
                          </Link>
                        </div>
                        <div
                          className="elementor-element elementor-element-d65f516 elementor-view-default elementor-widget elementor-widget-icon"
                          data-id="d65f516"
                          data-element_type="widget"
                          data-widget_type="icon.default"
                        >
                          <div className="elementor-icon-wrapper">
                            <button
                              type="button"
                              className="elementor-icon e-off-canvas__close"
                              aria-label="Zamknij menu"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className="elementor-element elementor-element-725e682 e-flex e-con-boxed e-con e-child"
                      data-id="725e682"
                      data-element_type="container"
                    >
                      <div className="e-con-inner">
                        <div
                          className="elementor-element elementor-element-2e0c14e elementor-widget elementor-widget-button"
                          data-id="2e0c14e"
                          data-element_type="widget"
                          data-settings='{"_animation":"fadeInUp"}'
                          data-widget_type="button.default"
                        >
                          <Link
                            className="elementor-button elementor-button-link elementor-size-sm"
                            href="/dodaj-ogloszenie/"
                          >
                            <span className="elementor-button-content-wrapper">
                              <span className="elementor-button-text">Dodaj ogłoszenie</span>
                            </span>
                          </Link>
                        </div>
                        <div
                          className="elementor-element elementor-element-d2e1808 elementor-widget elementor-widget-button"
                          data-id="d2e1808"
                          data-element_type="widget"
                          data-settings='{"_animation":"fadeInUp"}'
                          data-widget_type="button.default"
                        >
                          <Link
                            className="elementor-button elementor-button-link elementor-size-sm"
                            href="/zaloz-konto/"
                          >
                            <span className="elementor-button-content-wrapper">
                              <span className="elementor-button-text">Załóż konto</span>
                            </span>
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div
                      className="elementor-element elementor-element-2c37977 elementor-widget elementor-widget-nav-menu"
                      data-id="2c37977"
                      data-element_type="widget"
                      data-settings='{"submenu_icon":{"value":"<i aria-hidden=\"true\" class=\"\"></i>","library":""},"layout":"dropdown"}'
                      data-widget_type="nav-menu.default"
                    >
                      <nav className="elementor-nav-menu--dropdown elementor-nav-menu__container" aria-hidden="true">
                        <ul className="elementor-nav-menu">
                          <li className="menu-item">
                            <Link href="/ogloszenia/" className="elementor-item" tabIndex={-1}>
                              Ogłoszenia
                            </Link>
                          </li>
                          <MegaMenu />
                        </ul>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="elementor-widget-container">
              <button
                type="button"
                className="elementor-menu-toggle"
                aria-controls="off-canvas-native-preview"
                aria-label="Otwórz menu"
              >
                <span className="elementor-screen-only">Menu</span>
                <svg
                  aria-hidden="true"
                  className="e-font-icon-svg e-eicon-menu-bar"
                  viewBox="0 0 1000 1000"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M209 166h582c19 0 35 16 35 35s-16 35-35 35H209c-19 0-35-16-35-35s16-35 35-35zm582 264H209c-19 0-35 16-35 35s16 35 35 35h582c19 0 35-16 35-35s-16-35-35-35zm0 264H209c-19 0-35 16-35 35s16 35 35 35h582c19 0 35-16 35-35s-16-35-35-35z" />
                </svg>
              </button>
            </div>
          </div>

          <div
            className="elementor-element elementor-element-2d3dc09 elementor-nav-menu__align-justify elementor-nav-menu--dropdown-mobile elementor-nav-menu--stretch elementor-nav-menu__text-align-center elementor-hidden-tablet elementor-hidden-mobile elementor-widget elementor-widget-nav-menu"
            data-id="2d3dc09"
            data-element_type="widget"
            data-settings='{"layout":"horizontal","submenu_icon":{"value":"<i aria-hidden=\"true\" class=\"fas fa-caret-down\"></i>","library":"fa-solid"}}'
            data-widget_type="nav-menu.default"
          >
            <div className="elementor-widget-container">
              <nav className="elementor-nav-menu--main elementor-nav-menu__container" aria-label="Menu">
                <ul className="elementor-nav-menu">
                  <li className="menu-item">
                    <Link href="/ogloszenia/" className="elementor-item">
                      Ogłoszenia
                    </Link>
                  </li>
                  <MegaMenu />
                </ul>
              </nav>
            </div>
          </div>

          <div
            className="elementor-element elementor-element-18fa858 elementor-hidden-tablet elementor-hidden-mobile elementor-widget elementor-widget-button"
            data-id="18fa858"
            data-element_type="widget"
            data-settings='{"_animation":"fadeInUp"}'
            data-widget_type="button.default"
          >
            <div className="elementor-widget-container">
              <div className="elementor-button-wrapper">
                <Link
                  className="elementor-button elementor-button-link elementor-size-sm"
                  href="/dodaj-ogloszenie/"
                >
                  <span className="elementor-button-content-wrapper">
                    <span className="elementor-button-text">Dodaj ogłoszenie</span>
                  </span>
                </Link>
              </div>
            </div>
          </div>

          <div
            className="elementor-element elementor-element-322c0ea elementor-hidden-tablet elementor-hidden-mobile elementor-widget elementor-widget-button"
            data-id="322c0ea"
            data-element_type="widget"
            data-settings='{"_animation":"fadeInUp"}'
            data-widget_type="button.default"
          >
            <div className="elementor-widget-container">
              <div className="elementor-button-wrapper">
                <Link
                  className="elementor-button elementor-button-link elementor-size-sm"
                  href="/zaloz-konto/"
                >
                  <span className="elementor-button-content-wrapper">
                    <span className="elementor-button-text">Załóż konto</span>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
