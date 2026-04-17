import Link from "next/link";
import { BlogArchiveGrid } from "@/components/blog-archive-grid";
import type { BlogIndexItem } from "@/lib/blog-index";
import type { ElementorWidgetSignature } from "@/lib/elementor-posts-widget";
import { resolveWpImageUrl } from "@/lib/wp-image-variants";

type NativeHeroCard = {
  href: string;
  title: string;
  image: string | null;
  price: string | null;
  location: string | null;
  dateLabel: string | null;
};

type NativeHeroSectionProps = {
  title: string;
  subtitle: string;
  descriptionHtml: string;
  cards: NativeHeroCard[];
};

type NativeForestSectionProps = {
  eyebrow: string;
  titleHtml: string;
  description: string;
  buttonLabel: string;
  buttonHref: string;
};

type NativeLatestPostsSectionProps = {
  items: BlogIndexItem[];
  widgetSignature: ElementorWidgetSignature | null;
};

type NativeCommunitySectionProps = {
  title: string;
  primaryButtonHref: string;
  primaryButtonLabel: string;
  secondaryTitle: string;
  secondaryButtonHref: string;
  secondaryButtonLabel: string;
};

type NativeAboutSectionProps = {
  title: string;
  logo: string | null;
  paragraphs: string[];
};

type NativeBrandSectionProps = {
  title: string;
};

type NativePartnersSectionProps = {
  title: string;
  logo: string | null;
  partners: Array<{
    href: string;
    image: string | null;
    alt: string;
    width: number | null;
    height: number | null;
  }>;
};

export function NativeHomeHeroSection({
  title,
  subtitle,
  descriptionHtml,
  cards,
}: NativeHeroSectionProps) {
  return (
    <div
      className="elementor-element elementor-element-ec8c212 e-flex e-con-boxed e-con e-parent"
      data-id="ec8c212"
      data-element_type="container"
    >
      <div className="e-con-inner">
        <div
          className="elementor-element elementor-element-90d173b e-con-full e-flex e-con e-child"
          data-id="90d173b"
          data-element_type="container"
        >
          <div
            className="elementor-element elementor-element-f4d460b e-con-full e-flex e-con e-child"
            data-id="f4d460b"
            data-element_type="container"
          >
            <div
              className="elementor-element elementor-element-29a86f1 elementor-widget__width-auto elementor-widget-mobile__width-inherit elementor-widget elementor-widget-image"
              data-id="29a86f1"
              data-element_type="widget"
              data-widget_type="image.default"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                decoding="async"
                width={200}
                height={200}
                src="/wp-content/uploads/2024/01/biomasaportal.png"
                className="attachment-large size-large wp-image-63"
                alt="biomasa portal"
              />
            </div>
          </div>
          <div
            className="elementor-element elementor-element-b88a189 e-con-full e-flex e-con e-child"
            data-id="b88a189"
            data-element_type="container"
          >
            <div
              className="elementor-element elementor-element-6ac8868 elementor-widget__width-initial elementor-widget elementor-widget-heading"
              data-id="6ac8868"
              data-element_type="widget"
              data-widget_type="heading.default"
            >
              <h1 className="elementor-heading-title elementor-size-xl">{title}</h1>
            </div>
            <div
              className="elementor-element elementor-element-a97c29c elementor-widget-divider--view-line elementor-widget elementor-widget-divider"
              data-id="a97c29c"
              data-element_type="widget"
              data-widget_type="divider.default"
            >
              <div className="elementor-divider">
                <span className="elementor-divider-separator" />
              </div>
            </div>
            <div
              className="elementor-element elementor-element-44913aa elementor-widget elementor-widget-text-editor"
              data-id="44913aa"
              data-element_type="widget"
              data-widget_type="text-editor.default"
            >
              <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
            </div>
          </div>
        </div>

        <div
          className="elementor-element elementor-element-ca25516 elementor-widget elementor-widget-shortcode"
          data-id="ca25516"
          data-element_type="widget"
          data-widget_type="shortcode.default"
        >
          <div className="elementor-shortcode">
            <div className="biomasa-latest-ogloszenia">
              <div className="section-header">
                <h2>{subtitle}</h2>
                <Link href="/ogloszenia/" className="view-all">
                  Zobacz wszystkie
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M7.5 15l5-5-5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </Link>
              </div>

              <div className="ogloszenia-grid-home" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
                {cards.map((card) => (
                  <article key={card.href} className="ogloszenie-card-home">
                    <Link href={card.href} className="card-link">
                      {card.image ? (
                        <div className="card-image">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={resolveWpImageUrl(card.image, 640) ?? card.image}
                            alt={card.title}
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      ) : (
                        <div className="card-image placeholder" />
                      )}

                      <div className="card-content">
                        <h3 className="card-title">{card.title}</h3>
                        {card.price ? <div className="card-price">{card.price}</div> : null}
                        <div className="card-meta">
                          {card.location ? (
                            <span className="meta-location">
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path
                                  d="M7 1C4.24 1 2 3.24 2 6c0 3.5 5 7 5 7s5-3.5 5-7c0-2.76-2.24-5-5-5zm0 6.5c-.83 0-1.5-.67-1.5-1.5S6.17 4.5 7 4.5 8.5 5.17 8.5 6 7.83 7.5 7 7.5z"
                                  fill="currentColor"
                                />
                              </svg>
                              {card.location}
                            </span>
                          ) : null}
                          {card.dateLabel ? <span className="meta-date">{card.dateLabel}</span> : null}
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NativeHomeForestSection({
  eyebrow,
  titleHtml,
  description,
  buttonLabel,
  buttonHref,
}: NativeForestSectionProps) {
  return (
    <div
      className="elementor-element elementor-element-ef26ff1 e-con-full e-flex e-con e-child"
      data-id="ef26ff1"
      data-element_type="container"
      data-settings='{"background_background":"classic"}'
    >
      <div
        className="elementor-element elementor-element-6337412 e-con-full e-flex e-con e-child"
        data-id="6337412"
        data-element_type="container"
      >
        <div
          className="elementor-element elementor-element-ada63c6 elementor-widget elementor-widget-heading"
          data-id="ada63c6"
          data-element_type="widget"
          data-widget_type="heading.default"
        >
          <span
            className="elementor-heading-title elementor-size-default"
            dangerouslySetInnerHTML={{ __html: `${eyebrow}<br>${titleHtml}` }}
          />
        </div>
        <div
          className="elementor-element elementor-element-0437937 elementor-widget elementor-widget-text-editor"
          data-id="0437937"
          data-element_type="widget"
          data-widget_type="text-editor.default"
        >
          <p>{description}</p>
        </div>
        <div
          className="elementor-element elementor-element-11803d7 elementor-widget elementor-widget-button"
          data-id="11803d7"
          data-element_type="widget"
          data-widget_type="button.default"
        >
          <Link className="elementor-button elementor-button-link elementor-size-sm" href={buttonHref}>
            <span className="elementor-button-content-wrapper">
              <span className="elementor-button-text">{buttonLabel}</span>
            </span>
          </Link>
        </div>
      </div>
      <div
        className="elementor-element elementor-element-ba3aa79 e-con-full elementor-hidden-tablet elementor-hidden-mobile e-flex e-con e-child"
        data-id="ba3aa79"
        data-element_type="container"
      />
    </div>
  );
}

export function NativeHomeLatestPostsSection({
  items,
  widgetSignature,
}: NativeLatestPostsSectionProps) {
  return (
    <div
      className="elementor-element elementor-element-64cd8fb e-flex e-con-boxed e-con e-parent"
      data-id="64cd8fb"
      data-element_type="container"
      id="przejdz-dalej"
      data-settings='{"background_background":"classic","shape_divider_top":"waves"}'
    >
      <div className="e-con-inner">
        <div className="elementor-shape elementor-shape-top" aria-hidden="true" data-negative="false">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" preserveAspectRatio="none">
            <path
              className="elementor-shape-fill"
              d="M421.9,6.5c22.6-2.5,51.5,0.4,75.5,5.3c23.6,4.9,70.9,23.5,100.5,35.7c75.8,32.2,133.7,44.5,192.6,49.7 c23.6,2.1,48.7,3.5,103.4-2.5c54.7-6,106.2-25.6,106.2-25.6V0H0v30.3c0,0,72,32.6,158.4,30.5c39.2-0.7,92.8-6.7,134-22.4 c21.2-8.1,52.2-18.2,79.7-24.2C399.3,7.9,411.6,7.5,421.9,6.5z"
            />
          </svg>
        </div>
        <div
          className="elementor-element elementor-element-17b73e8 e-con-full e-flex e-con e-child"
          data-id="17b73e8"
          data-element_type="container"
        >
          <div
            className="elementor-element elementor-element-fa5ec51 elementor-hidden-tablet elementor-hidden-mobile elementor-widget elementor-widget-spacer"
            data-id="fa5ec51"
            data-element_type="widget"
            data-widget_type="spacer.default"
          >
            <div className="elementor-spacer">
              <div className="elementor-spacer-inner" />
            </div>
          </div>
          <div
            className="elementor-element elementor-element-6154911 elementor-widget elementor-widget-menu-anchor"
            data-id="6154911"
            data-element_type="widget"
            data-widget_type="menu-anchor.default"
          >
            <div className="elementor-menu-anchor" id="zespol" />
          </div>
          <div
            className="elementor-element elementor-element-642efff elementor-hidden-desktop elementor-widget elementor-widget-spacer"
            data-id="642efff"
            data-element_type="widget"
            data-widget_type="spacer.default"
          >
            <div className="elementor-spacer">
              <div className="elementor-spacer-inner" />
            </div>
          </div>
          <div
            className="elementor-element elementor-element-afee595 e-con-full e-flex e-con e-child"
            data-id="afee595"
            data-element_type="container"
          >
            <div
              className="elementor-element elementor-element-4e9dc30 e-con-full e-flex e-con e-child"
              data-id="4e9dc30"
              data-element_type="container"
            >
              <div
                className="elementor-element elementor-element-fd54d6e elementor-widget elementor-widget-image"
                data-id="fd54d6e"
                data-element_type="widget"
                data-widget_type="image.default"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  loading="lazy"
                  decoding="async"
                  width={200}
                  height={200}
                  src="/wp-content/uploads/2024/01/cropped-biomasaportal.png"
                  className="attachment-full size-full wp-image-64"
                  alt=""
                />
              </div>
            </div>
            <div
              className="elementor-element elementor-element-2a2560b e-con-full e-flex e-con e-child"
              data-id="2a2560b"
              data-element_type="container"
            >
              <div
                className="elementor-element elementor-element-d2288e0 elementor-widget elementor-widget-heading"
                data-id="d2288e0"
                data-element_type="widget"
                data-widget_type="heading.default"
              >
                <h2 className="elementor-heading-title elementor-size-xl">Aktualności</h2>
              </div>
            </div>
          </div>
          <div
            className="elementor-element elementor-element-a94452a elementor-hidden-tablet elementor-hidden-mobile elementor-widget elementor-widget-spacer"
            data-id="a94452a"
            data-element_type="widget"
            data-widget_type="spacer.default"
          >
            <div className="elementor-spacer">
              <div className="elementor-spacer-inner" />
            </div>
          </div>
          <div
            className="elementor-element elementor-element-ac30b5a elementor-widget-divider--view-line elementor-widget elementor-widget-divider"
            data-id="ac30b5a"
            data-element_type="widget"
            data-widget_type="divider.default"
          >
            <div className="elementor-divider">
              <span className="elementor-divider-separator" />
            </div>
          </div>
          <div
            className="elementor-element elementor-element-6799c0c elementor-hidden-tablet elementor-hidden-mobile elementor-widget elementor-widget-spacer"
            data-id="6799c0c"
            data-element_type="widget"
            data-widget_type="spacer.default"
          >
            <div className="elementor-spacer">
              <div className="elementor-spacer-inner" />
            </div>
          </div>
          <BlogArchiveGrid
            items={items}
            widgetSignature={widgetSignature}
            showSummary={false}
            perPage={8}
          />
          <div
            className="elementor-element elementor-element-ca41823 elementor-align-right elementor-mobile-align-center elementor-widget elementor-widget-button"
            data-id="ca41823"
            data-element_type="widget"
            data-widget_type="button.default"
          >
            <div className="elementor-widget-container">
              <div className="elementor-button-wrapper">
                <Link className="elementor-button elementor-button-link elementor-size-xs" href="/wpisy/">
                  <span className="elementor-button-content-wrapper">
                    <span className="elementor-button-text">Wszystkie wpisy</span>
                  </span>
                </Link>
              </div>
            </div>
          </div>
          <div
            className="elementor-element elementor-element-ac697fa elementor-hidden-tablet elementor-hidden-phone elementor-widget elementor-widget-spacer"
            data-id="ac697fa"
            data-element_type="widget"
            data-widget_type="spacer.default"
          >
            <div className="elementor-spacer">
              <div className="elementor-spacer-inner" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NativeHomeCommunitySection({
  title,
  primaryButtonHref,
  primaryButtonLabel,
  secondaryTitle,
  secondaryButtonHref,
  secondaryButtonLabel,
}: NativeCommunitySectionProps) {
  const buttonIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="21.4171" height="24.1932" viewBox="0 0 21.4171 24.1932">
      <path d="M15.6268,7.0532,4.9667,1.0378a2.7392,2.7392,0,0,0-2.7255.007l10.02,9.45Z" transform="translate(-0.457 -0.6782)" />
      <path d="M.852,2.4629A2.7868,2.7868,0,0,0,.457,3.8875v17.71a2.7979,2.7979,0,0,0,.3682,1.39l10.34-10.69Z" transform="translate(-0.457 -0.6782)" />
      <path d="M20.5212,9.6685,17.3765,7.8169l-3.5337,3.7693,4.3307,4.2621,2.3491-1.3834a2.8028,2.8028,0,0,0-.0014-4.7964Z" transform="translate(-0.457 -0.6782)" />
      <path d="M2.2412,24.4486a2.6413,2.6413,0,0,0,1.4081.4228,2.63,2.63,0,0,0,1.3722-.3939l11.4977-6.9964-4.14-4.2106Z" transform="translate(-0.457 -0.6782)" />
    </svg>
  );

  return (
    <div
      className="elementor-element elementor-element-7882e66c e-con-full e-flex e-con e-parent"
      data-id="7882e66c"
      data-element_type="container"
    >
      <div
        className="elementor-element elementor-element-3f6cde49 e-con-full e-flex e-con e-child"
        data-id="3f6cde49"
        data-element_type="container"
      >
        <div
          className="elementor-element elementor-element-424d5775 e-con-full e-flex e-con e-child"
          data-id="424d5775"
          data-element_type="container"
        >
          <div
            className="elementor-element elementor-element-5bc2bb5e elementor-widget elementor-widget-image-box"
            data-id="5bc2bb5e"
            data-element_type="widget"
            data-widget_type="image-box.default"
          >
            <div className="elementor-image-box-wrapper">
              <div className="elementor-image-box-content">
                <h4 className="elementor-image-box-title">{title}</h4>
              </div>
            </div>
          </div>
          <div
            className="elementor-element elementor-element-3a5c2a0b e-con-full e-flex e-con e-child"
            data-id="3a5c2a0b"
            data-element_type="container"
          >
            <div
              className="elementor-element elementor-element-3563b1e4 elementor-widget__width-initial elementor-tablet-align-right elementor-widget-mobile__width-auto elementor-hidden-tablet elementor-hidden-mobile elementor-widget elementor-widget-button"
              data-id="3563b1e4"
              data-element_type="widget"
              data-widget_type="button.default"
            >
              <a
                className="elementor-button elementor-button-link elementor-size-sm elementor-animation-float"
                href={primaryButtonHref}
              >
                <span className="elementor-button-content-wrapper">
                  <span className="elementor-button-icon">{buttonIcon}</span>
                  <span className="elementor-button-text">{primaryButtonLabel}</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div
        className="elementor-element elementor-element-12ac9b34 e-con-full e-flex e-con e-child"
        data-id="12ac9b34"
        data-element_type="container"
        data-settings='{"background_background":"classic"}'
      >
        <div
          className="elementor-element elementor-element-7a9e16c elementor-widget__width-initial elementor-tablet-align-right elementor-widget-mobile__width-auto elementor-hidden-desktop elementor-widget elementor-widget-button"
          data-id="7a9e16c"
          data-element_type="widget"
          data-widget_type="button.default"
        >
          <a
            className="elementor-button elementor-button-link elementor-size-sm elementor-animation-float"
            href={secondaryButtonHref}
          >
            <span className="elementor-button-content-wrapper">
              <span className="elementor-button-icon">{buttonIcon}</span>
              <span className="elementor-button-text">{secondaryButtonLabel}</span>
            </span>
          </a>
        </div>
        <div
          className="elementor-element elementor-element-89a02af e-con-full e-flex e-con e-child"
          data-id="89a02af"
          data-element_type="container"
        >
          <div
            className="elementor-element elementor-element-2b91bc0 e-con-full e-flex e-con e-child"
            data-id="2b91bc0"
            data-element_type="container"
          >
            <div
              className="elementor-element elementor-element-68c01f31 elementor-widget elementor-widget-image-box"
              data-id="68c01f31"
              data-element_type="widget"
              data-widget_type="image-box.default"
            >
              <div className="elementor-image-box-wrapper">
                <div className="elementor-image-box-content">
                  <h4
                    className="elementor-image-box-title"
                    dangerouslySetInnerHTML={{ __html: secondaryTitle }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NativeHomeAboutSection({
  title,
  logo,
  paragraphs,
}: NativeAboutSectionProps) {
  const logoUrl = resolveWpImageUrl(logo, 320) ?? logo ?? "/wp-content/uploads/2024/01/cropped-biomasaportal.png";

  return (
    <div
      className="elementor-element elementor-element-8096431 e-flex e-con-boxed e-con e-parent"
      data-id="8096431"
      data-element_type="container"
    >
      <div className="e-con-inner">
        <div className="elementor-shape elementor-shape-top" aria-hidden="true" data-negative="false">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" preserveAspectRatio="none">
            <path
              className="elementor-shape-fill"
              d="M421.9,6.5c22.6-2.5,51.5,0.4,75.5,5.3c23.6,4.9,70.9,23.5,100.5,35.7c75.8,32.2,133.7,44.5,192.6,49.7 c23.6,2.1,48.7,3.5,103.4-2.5c54.7-6,106.2-25.6,106.2-25.6V0H0v30.3c0,0,72,32.6,158.4,30.5c39.2-0.7,92.8-6.7,134-22.4 c21.2-8.1,52.2-18.2,79.7-24.2C399.3,7.9,411.6,7.5,421.9,6.5z"
            />
          </svg>
        </div>
        <div
          className="elementor-element elementor-element-f472e69 e-con-full e-flex e-con e-child"
          data-id="f472e69"
          data-element_type="container"
        >
          <div
            className="elementor-element elementor-element-5539ba4 elementor-hidden-tablet elementor-hidden-mobile elementor-widget elementor-widget-spacer"
            data-id="5539ba4"
            data-element_type="widget"
            data-widget_type="spacer.default"
          >
            <div className="elementor-spacer">
              <div className="elementor-spacer-inner" />
            </div>
          </div>
          <div
            className="elementor-element elementor-element-07ed434 elementor-widget elementor-widget-menu-anchor"
            data-id="07ed434"
            data-element_type="widget"
            data-widget_type="menu-anchor.default"
          >
            <div className="elementor-menu-anchor" id="zespol" />
          </div>
          <div
            className="elementor-element elementor-element-a99a4bf elementor-hidden-desktop elementor-widget elementor-widget-spacer"
            data-id="a99a4bf"
            data-element_type="widget"
            data-widget_type="spacer.default"
          >
            <div className="elementor-spacer">
              <div className="elementor-spacer-inner" />
            </div>
          </div>
          <div
            className="elementor-element elementor-element-dd0c68e e-con-full e-flex e-con e-child"
            data-id="dd0c68e"
            data-element_type="container"
          >
            <div
              className="elementor-element elementor-element-d698c73 e-con-full e-flex e-con e-child"
              data-id="d698c73"
              data-element_type="container"
            >
              <div
                className="elementor-element elementor-element-3e31e4f elementor-widget elementor-widget-heading"
                data-id="3e31e4f"
                data-element_type="widget"
                data-widget_type="heading.default"
              >
                <h2 className="elementor-heading-title elementor-size-xl">{title}</h2>
              </div>
            </div>
            <div
              className="elementor-element elementor-element-a7fea3a e-con-full e-flex e-con e-child"
              data-id="a7fea3a"
              data-element_type="container"
            >
              <div
                className="elementor-element elementor-element-9fb4ebc elementor-widget elementor-widget-image"
                data-id="9fb4ebc"
                data-element_type="widget"
                data-widget_type="image.default"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img loading="lazy" decoding="async" width={200} height={200} src={logoUrl} className="attachment-full size-full wp-image-64" alt="" />
              </div>
            </div>
          </div>
          <div
            className="elementor-element elementor-element-96e1dba elementor-widget-divider--view-line elementor-widget elementor-widget-divider"
            data-id="96e1dba"
            data-element_type="widget"
            data-widget_type="divider.default"
          >
            <div className="elementor-divider">
              <span className="elementor-divider-separator" />
            </div>
          </div>
          <div
            className="elementor-element elementor-element-b74591d elementor-widget elementor-widget-text-editor"
            data-id="b74591d"
            data-element_type="widget"
            data-widget_type="text-editor.default"
          >
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function NativeHomeBrandSection({ title }: NativeBrandSectionProps) {
  return (
    <div
      className="elementor-element elementor-element-87f408c e-con-full e-flex e-con e-parent"
      data-id="87f408c"
      data-element_type="container"
    >
      <div
        className="elementor-element elementor-element-f0296bd elementor-widget elementor-widget-heading"
        data-id="f0296bd"
        data-element_type="widget"
        data-widget_type="heading.default"
      >
        <h2 className="elementor-heading-title elementor-size-xl">{title}</h2>
      </div>
    </div>
  );
}

export function NativeHomePartnersSection({
  title,
  logo,
  partners,
}: NativePartnersSectionProps) {
  const logoUrl = resolveWpImageUrl(logo, 320) ?? logo ?? "/wp-content/uploads/2024/01/cropped-biomasaportal.png";

  return (
    <div
      className="elementor-element elementor-element-daaafec e-flex e-con-boxed e-con e-parent"
      data-id="daaafec"
      data-element_type="container"
    >
      <div className="e-con-inner">
        <div className="elementor-shape elementor-shape-top" aria-hidden="true" data-negative="false">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" preserveAspectRatio="none">
            <path
              className="elementor-shape-fill"
              d="M421.9,6.5c22.6-2.5,51.5,0.4,75.5,5.3c23.6,4.9,70.9,23.5,100.5,35.7c75.8,32.2,133.7,44.5,192.6,49.7 c23.6,2.1,48.7,3.5,103.4-2.5c54.7-6,106.2-25.6,106.2-25.6V0H0v30.3c0,0,72,32.6,158.4,30.5c39.2-0.7,92.8-6.7,134-22.4 c21.2-8.1,52.2-18.2,79.7-24.2C399.3,7.9,411.6,7.5,421.9,6.5z"
            />
          </svg>
        </div>
        <div
          className="elementor-element elementor-element-011a064 e-con-full e-flex e-con e-child"
          data-id="011a064"
          data-element_type="container"
        >
          <div
            className="elementor-element elementor-element-49ca672 elementor-hidden-tablet elementor-hidden-mobile elementor-widget elementor-widget-spacer"
            data-id="49ca672"
            data-element_type="widget"
            data-widget_type="spacer.default"
          >
            <div className="elementor-spacer">
              <div className="elementor-spacer-inner" />
            </div>
          </div>
          <div
            className="elementor-element elementor-element-28208cc elementor-widget elementor-widget-menu-anchor"
            data-id="28208cc"
            data-element_type="widget"
            data-widget_type="menu-anchor.default"
          >
            <div className="elementor-menu-anchor" id="zespol" />
          </div>
          <div
            className="elementor-element elementor-element-bd6137b elementor-hidden-desktop elementor-widget elementor-widget-spacer"
            data-id="bd6137b"
            data-element_type="widget"
            data-widget_type="spacer.default"
          >
            <div className="elementor-spacer">
              <div className="elementor-spacer-inner" />
            </div>
          </div>
          <div
            className="elementor-element elementor-element-4451cfa e-con-full e-flex e-con e-child"
            data-id="4451cfa"
            data-element_type="container"
          >
            <div
              className="elementor-element elementor-element-7d19cb0 e-con-full e-flex e-con e-child"
              data-id="7d19cb0"
              data-element_type="container"
            >
              <div
                className="elementor-element elementor-element-41e094f elementor-widget elementor-widget-image"
                data-id="41e094f"
                data-element_type="widget"
                data-widget_type="image.default"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img loading="lazy" decoding="async" width={200} height={200} src={logoUrl} className="attachment-full size-full wp-image-64" alt="" />
              </div>
            </div>
            <div
              className="elementor-element elementor-element-bf41b50 e-con-full e-flex e-con e-child"
              data-id="bf41b50"
              data-element_type="container"
            >
              <div
                className="elementor-element elementor-element-f8e3320 elementor-widget elementor-widget-heading"
                data-id="f8e3320"
                data-element_type="widget"
                data-widget_type="heading.default"
              >
                <h2 className="elementor-heading-title elementor-size-xl">{title}</h2>
              </div>
            </div>
          </div>
          <div
            className="elementor-element elementor-element-8d6c239 elementor-hidden-tablet elementor-hidden-mobile elementor-widget elementor-widget-spacer"
            data-id="8d6c239"
            data-element_type="widget"
            data-widget_type="spacer.default"
          >
            <div className="elementor-spacer">
              <div className="elementor-spacer-inner" />
            </div>
          </div>
          <div
            className="elementor-element elementor-element-b2bd9b8 elementor-widget-divider--view-line elementor-widget elementor-widget-divider"
            data-id="b2bd9b8"
            data-element_type="widget"
            data-widget_type="divider.default"
          >
            <div className="elementor-divider">
              <span className="elementor-divider-separator" />
            </div>
          </div>
          <div
            className="elementor-element elementor-element-593114c elementor-hidden-tablet elementor-hidden-phone elementor-widget elementor-widget-spacer"
            data-id="593114c"
            data-element_type="widget"
            data-widget_type="spacer.default"
          >
            <div className="elementor-spacer">
              <div className="elementor-spacer-inner" />
            </div>
          </div>
          <div
            className="elementor-element elementor-element-6cc0ff0 e-con-full e-flex e-con e-child"
            data-id="6cc0ff0"
            data-element_type="container"
          >
            {partners.map((partner, index) => (
              <div
                key={partner.href}
                className="elementor-element e-con-full e-flex e-con e-child"
                data-id={["00cc906", "b1e1dcb", "155256e"][index] ?? `partner-${index}`}
                data-element_type="container"
              >
                <div
                  className="elementor-element elementor-widget__width-initial elementor-widget elementor-widget-image"
                  data-id={["ef8df70", "d5eeb51", "ca0fde1"][index] ?? `partner-widget-${index}`}
                  data-element_type="widget"
                  data-widget_type="image.default"
                >
                  <a href={partner.href}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      loading="eager"
                      decoding="async"
                      src={resolveWpImageUrl(partner.image, 640) ?? partner.image ?? ""}
                      className="attachment-large size-large"
                      alt={partner.alt}
                      width={partner.width ?? undefined}
                      height={partner.height ?? undefined}
                      style={{ display: "block", width: "100%", height: "auto" }}
                    />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
