import Link from "next/link";
import type { BlogIndexItem } from "@/lib/blog-index";
import { getOptimizedWpImageUrl, resolveWpImageUrl } from "@/lib/wp-image-variants";

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

const dayMonthFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "long",
});

const yearFormatter = new Intl.DateTimeFormat("pl-PL", {
  year: "numeric",
});

function formatHomeDate(value: string) {
  const date = new Date(value);
  return `${dayMonthFormatter.format(date)}, ${yearFormatter.format(date)}`;
}

export function NativeHomeHeroSection({
  title,
  subtitle,
  descriptionHtml,
  cards,
}: NativeHeroSectionProps) {
  return (
    <section className="native-home-hero">
      <div className="native-home-section__inner native-home-hero__inner">
        <div className="native-home-hero__intro">
          <div className="native-home-hero__logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              decoding="async"
              width={200}
              height={200}
              src="/wp-content/uploads/2024/01/biomasaportal.png"
              alt="Biomasa Portal"
            />
          </div>
          <div className="native-home-hero__content">
            <h1>{title}</h1>
            <div className="native-home-hero__divider" />
            <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
          </div>
        </div>

        <div className="native-home-hero__list">
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

            <div className="ogloszenia-grid-home">
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
    </section>
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
    <section className="native-home-forest">
      <div className="native-home-section__inner native-home-forest__inner">
        <div className="native-home-forest__content">
          <p className="native-home-forest__eyebrow">{eyebrow}</p>
          <h2 dangerouslySetInnerHTML={{ __html: titleHtml }} />
          <p>{description}</p>
          <Link className="native-home-forest__button" href={buttonHref}>
            {buttonLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}

export function NativeHomeLatestPostsSection({
  items,
}: NativeLatestPostsSectionProps) {
  return (
    <section className="native-home-latest-posts" id="przejdz-dalej">
      <div className="native-home-section__inner native-home-latest-posts__inner">
        <div className="native-home-latest-posts__header">
          <div className="native-home-latest-posts__brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              loading="lazy"
              decoding="async"
              width={200}
              height={200}
              src="/wp-content/uploads/2024/01/cropped-biomasaportal.png"
              alt=""
            />
          </div>
          <div className="native-home-latest-posts__title-block">
            <h2>Aktualności</h2>
          </div>
        </div>
        <div className="native-home-latest-posts__divider" />
        <div className="native-home-latest-posts__grid">
          {items.map((item) => (
            <article key={item.id} className="native-home-post-card">
              <div className="native-home-post-card__card">
                {getOptimizedWpImageUrl(item.image, 640) ? (
                  <Link className="native-home-post-card__thumbnail" href={item.path} tabIndex={-1}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getOptimizedWpImageUrl(item.image, 640) ?? ""}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                    />
                  </Link>
                ) : null}
                <div className="native-home-post-card__badge">{item.categoryName}</div>
                <div className="native-home-post-card__body">
                  <h3>
                    <Link href={item.path}>{item.title}</Link>
                  </h3>
                  <p>{item.excerpt}</p>
                  <Link
                    className="native-home-post-card__read-more"
                    href={item.path}
                    aria-label={`Czytaj więcej o ${item.title}`}
                  >
                    Czytaj więcej &gt;
                  </Link>
                </div>
                <div className="native-home-post-card__meta">
                  <span>{formatHomeDate(item.lastModified)}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="native-home-latest-posts__cta">
          <Link className="native-home-latest-posts__button" href="/wpisy/">
            Wszystkie wpisy
          </Link>
        </div>
      </div>
    </section>
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
    <section className="native-home-community">
      <div className="native-home-section__inner native-home-community__inner">
        <div className="native-home-community__copy">
          <h2>{title}</h2>
          <a className="native-home-community__button" href={primaryButtonHref}>
            <span className="native-home-community__button-icon">{buttonIcon}</span>
            <span>{primaryButtonLabel}</span>
          </a>
        </div>
        <div className="native-home-community__phone">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/wp-content/uploads/2024/01/community-facebook-preview.png"
            alt="Grupa Biomasa Portal na Facebooku"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="native-home-community__secondary">
          <h3 dangerouslySetInnerHTML={{ __html: secondaryTitle }} />
          <a className="native-home-community__button native-home-community__button--mobile" href={secondaryButtonHref}>
            <span className="native-home-community__button-icon">{buttonIcon}</span>
            <span>{secondaryButtonLabel}</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export function NativeHomeAboutSection({
  title,
  logo,
  paragraphs,
}: NativeAboutSectionProps) {
  const logoUrl = resolveWpImageUrl(logo, 320) ?? logo ?? "/wp-content/uploads/2024/01/cropped-biomasaportal.png";

  return (
    <section className="native-home-about">
      <div className="native-home-section__inner native-home-about__inner">
        <div className="native-home-about__header">
          <div className="native-home-about__title">
            <h2>{title}</h2>
          </div>
          <div className="native-home-about__logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img loading="lazy" decoding="async" width={200} height={200} src={logoUrl} alt="" />
          </div>
        </div>
        <div className="native-home-about__divider" />
        <div className="native-home-about__content">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

export function NativeHomeBrandSection({ title }: NativeBrandSectionProps) {
  return (
    <section className="native-home-brand">
      <div className="native-home-section__inner">
        <h2>{title}</h2>
      </div>
    </section>
  );
}

export function NativeHomePartnersSection({
  title,
  logo,
  partners,
}: NativePartnersSectionProps) {
  const logoUrl = resolveWpImageUrl(logo, 320) ?? logo ?? "/wp-content/uploads/2024/01/cropped-biomasaportal.png";

  return (
    <section className="native-home-partners">
      <div className="native-home-section__inner native-home-partners__inner">
        <div className="native-home-partners__header">
          <div className="native-home-partners__logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img loading="lazy" decoding="async" width={200} height={200} src={logoUrl} alt="" />
          </div>
          <div className="native-home-partners__title">
            <h2>{title}</h2>
          </div>
        </div>
        <div className="native-home-partners__divider" />
        <div className="native-home-partners__grid">
          {partners.map((partner) => (
            <div key={partner.href} className="native-home-partners__item">
              <a href={partner.href}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  loading="eager"
                  decoding="async"
                  src={resolveWpImageUrl(partner.image, 640) ?? partner.image ?? ""}
                  alt={partner.alt}
                  width={partner.width ?? undefined}
                  height={partner.height ?? undefined}
                />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
