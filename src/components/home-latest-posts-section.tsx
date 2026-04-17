import Link from "next/link";
import { BlogArchiveGrid } from "@/components/blog-archive-grid";
import type { BlogIndexItem } from "@/lib/blog-index";
import type { ElementorWidgetSignature } from "@/lib/elementor-posts-widget";

type HomeLatestPostsSectionProps = {
  items: BlogIndexItem[];
  widgetSignature?: ElementorWidgetSignature | null;
};

export function HomeLatestPostsSection({
  items,
  widgetSignature = null,
}: HomeLatestPostsSectionProps) {
  return (
    <div
      className="elementor-element elementor-element-64cd8fb e-flex e-con-boxed e-con e-parent"
      id="przejdz-dalej"
      data-id="64cd8fb"
      data-element_type="container"
      data-settings='{"background_background":"classic","shape_divider_top":"waves"}'
    >
      <div className="e-con-inner">
        <div
          className="elementor-shape elementor-shape-top"
          aria-hidden="true"
          data-negative="false"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1000 100"
            preserveAspectRatio="none"
          >
            <path
              className="elementor-shape-fill"
              d="M421.9,6.5c22.6-2.5,51.5,0.4,75.5,5.3c23.6,4.9,70.9,23.5,100.5,35.7c75.8,32.2,133.7,44.5,192.6,49.7
	c23.6,2.1,48.7,3.5,103.4-2.5c54.7-6,106.2-25.6,106.2-25.6V0H0v30.3c0,0,72,32.6,158.4,30.5c39.2-0.7,92.8-6.7,134-22.4
	c21.2-8.1,52.2-18.2,79.7-24.2C399.3,7.9,411.6,7.5,421.9,6.5z"
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
                  width="200"
                  height="200"
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
                <h2 className="elementor-heading-title elementor-size-xl">
                  Aktualności
                </h2>
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
            perPage={8}
            basePath="/wpisy/"
            widgetSignature={widgetSignature}
            showSummary={false}
          />

          <div
            className="elementor-element elementor-element-ca41823 elementor-align-right elementor-mobile-align-center elementor-widget elementor-widget-button"
            data-id="ca41823"
            data-element_type="widget"
            data-widget_type="button.default"
          >
            <div className="elementor-widget-container">
              <div className="elementor-button-wrapper">
                <Link
                  className="elementor-button elementor-button-link elementor-size-xs"
                  href="/wpisy/"
                >
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
