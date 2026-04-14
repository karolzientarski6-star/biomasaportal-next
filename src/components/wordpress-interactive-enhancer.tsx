"use client";

import { useEffect } from "react";

type BlogSearchResult = {
  path: string;
  title: string;
  excerpt: string;
  image: string | null;
};

type BlogSearchPayload = {
  query: string;
  totalResults: number;
  results: BlogSearchResult[];
};

type WordPressInteractiveEnhancerProps = {
  path: string;
  featuredImage?: string | null;
  isSinglePost?: boolean;
};

declare global {
  interface Window {
    toggleFAQ?: (element: HTMLElement) => void;
    __codexBlogSearchAbort?: AbortController;
  }
}

function slugifyHeading(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function parseTocHeadingSelectors(widget: HTMLElement) {
  const defaultSelectors = ["h2"];
  const rawSettings = widget.dataset.settings;

  if (!rawSettings) {
    return defaultSelectors;
  }

  try {
    const settings = JSON.parse(rawSettings) as {
      headings_by_tags?: string[];
    };
    const selectors = settings.headings_by_tags
      ?.map((tag) => tag.trim().toLowerCase())
      .filter((tag) => /^h[1-6]$/.test(tag));

    return selectors?.length ? selectors : defaultSelectors;
  } catch {
    return defaultSelectors;
  }
}

function applyAosAttributes(root: ParentNode) {
  const selectors = [
    ".elementor-widget-heading",
    ".elementor-widget-text-editor",
    ".elementor-widget-image",
    ".elementor-widget-button",
    ".elementor-post",
    ".faq-item",
    ".biomasa-category-tile",
    ".blog-category-seo-copy",
    ".editorial-hub-intro",
  ];

  let delay = 0;

  for (const element of root.querySelectorAll<HTMLElement>(selectors.join(", "))) {
    if (element.dataset.aos) {
      continue;
    }

    element.dataset.aos = element.classList.contains("elementor-post")
      ? "fade-up"
      : "fade-in";
    element.dataset.aosDelay = String(delay);
    delay = (delay + 40) % 160;
  }
}

function applyFeaturedImage(root: ParentNode, featuredImage?: string | null) {
  if (!featuredImage) {
    return;
  }

  const postRoot = root.querySelector<HTMLElement>("[data-elementor-post-type='post']");
  const hero = postRoot?.querySelector<HTMLElement>(":scope > .elementor-element:first-child");

  if (hero) {
    hero.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55)), url("${featuredImage}")`;
    hero.style.backgroundPosition = "center";
    hero.style.backgroundRepeat = "no-repeat";
    hero.style.backgroundSize = "cover";
  }

  for (const tocWidget of root.querySelectorAll<HTMLElement>(".elementor-widget-table-of-contents")) {
    tocWidget.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.52), rgba(0, 0, 0, 0.52)), url("${featuredImage}")`;
    tocWidget.style.backgroundPosition = "center";
    tocWidget.style.backgroundRepeat = "no-repeat";
    tocWidget.style.backgroundSize = "cover";
  }
}

function buildTableOfContents(root: ParentNode) {
  const tocWidgets = root.querySelectorAll<HTMLElement>(".elementor-widget-table-of-contents");

  if (!tocWidgets.length) {
    return;
  }

  for (const tocWidget of tocWidgets) {
    const tocBody = tocWidget.querySelector<HTMLElement>(".elementor-toc__body");
    const headingSelectors = parseTocHeadingSelectors(tocWidget);
    const headings = Array.from(
      root.querySelectorAll<HTMLHeadingElement>(headingSelectors.join(", ")),
    )
      .filter((heading) => !heading.closest(".elementor-widget-table-of-contents"))
      .map((heading) => ({
        element: heading,
        text: heading.textContent?.replace(/\s+/g, " ").trim() ?? "",
      }))
      .filter((heading) => heading.text.length > 0);

    if (!tocBody || !headings.length) {
      continue;
    }

    headings.forEach(({ element, text }, index) => {
      const fallbackId = `elementor-toc__heading-anchor-${index}`;
      element.id = element.id || fallbackId;
      if (!element.id.startsWith("elementor-toc__heading-anchor-")) {
        element.id = `${fallbackId}-${slugifyHeading(text).slice(0, 48)}`;
      }
    });

    const list = headings
      .map(
        ({ element, text }, index) =>
          `<li class="elementor-toc__list-item"><div class="elementor-toc__list-item-text-wrapper"><a href="#${element.id}" class="elementor-toc__list-item-text${index === 0 ? " elementor-item-active" : ""}">${text}</a></div></li>`,
      )
      .join("");

    tocBody.innerHTML = `<ol class="elementor-toc__list-wrapper">${list}</ol>`;
  }
}

function toggleFaqItem(questionElement: HTMLElement) {
  const item = questionElement.closest<HTMLElement>(".faq-item");

  if (!item) {
    return;
  }

  item.classList.toggle("active");
  window.dispatchEvent(
    new CustomEvent("biomasa:faq-toggle", {
      detail: {
        question: questionElement.textContent?.replace(/\s+/g, " ").trim(),
        expanded: item.classList.contains("active"),
      },
    }),
  );
}

function setupFaq(root: ParentNode) {
  window.toggleFAQ = toggleFaqItem;

  for (const question of root.querySelectorAll<HTMLElement>(".faq-question")) {
    question.setAttribute("role", "button");
    question.tabIndex = 0;

    if (!question.dataset.codexFaqBound) {
      if (!question.getAttribute("onclick")) {
        question.addEventListener("click", () => toggleFaqItem(question));
      }
      question.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggleFaqItem(question);
        }
      });
      question.dataset.codexFaqBound = "true";
    }
  }
}

function renderSearchResults(
  container: HTMLElement,
  template: HTMLElement,
  results: BlogSearchResult[],
) {
  if (results.length === 0) {
    container.innerHTML =
      '<div class="elementor-search-form__empty">Brak wpis\u00f3w pasuj\u0105cych do wyszukiwania.</div>';
    return;
  }

  container.innerHTML = "";

  for (const result of results) {
    const article = template.cloneNode(true) as HTMLElement;
    const links = article.querySelectorAll<HTMLAnchorElement>("a[href]");

    links.forEach((link) => {
      link.href = result.path;
    });

    const titleLink = article.querySelector<HTMLAnchorElement>(".elementor-post__title a");
    if (titleLink) {
      titleLink.textContent = result.title;
      titleLink.href = result.path;
    }

    const excerpt = article.querySelector<HTMLElement>(".elementor-post__excerpt p");
    if (excerpt) {
      excerpt.textContent = result.excerpt;
    }

    const imageLink = article.querySelector<HTMLElement>(".elementor-post__thumbnail__link");
    const image = article.querySelector<HTMLImageElement>(".elementor-post__thumbnail img");

    if (result.image && image) {
      image.src = result.image;
      image.srcset = result.image;
      image.alt = result.title;
      if (imageLink instanceof HTMLAnchorElement) {
        imageLink.href = result.path;
      }
    } else if (imageLink) {
      imageLink.remove();
    }

    container.append(article);
  }
}

function setupOffCanvas(root: ParentNode) {
  const offCanvas = root.querySelector<HTMLElement>(".e-off-canvas");

  if (!offCanvas) {
    return;
  }

  // Ensure hidden state is set initially
  if (!offCanvas.hasAttribute("aria-hidden")) {
    offCanvas.setAttribute("aria-hidden", "true");
  }

  const openPanel = () => {
    offCanvas.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closePanel = () => {
    offCanvas.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  // Toggle buttons: hamburger / menu-toggle
  const toggleButtons = root.querySelectorAll<HTMLElement>(
    ".elementor-menu-toggle, .e-off-canvas-toggle, [data-e-toggle], [aria-controls]",
  );

  for (const btn of toggleButtons) {
    if (btn.dataset.codexOffCanvasBound) continue;
    btn.dataset.codexOffCanvasBound = "true";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const isHidden = offCanvas.getAttribute("aria-hidden") !== "false";
      if (isHidden) {
        openPanel();
      } else {
        closePanel();
      }
    });
  }

  // Close buttons inside off-canvas
  const closeButtons = offCanvas.querySelectorAll<HTMLElement>(
    ".e-off-canvas__close, .elementor-off-canvas__close, [class*='close']",
  );

  for (const btn of closeButtons) {
    if (btn.dataset.codexOffCanvasCloseBound) continue;
    btn.dataset.codexOffCanvasCloseBound = "true";
    btn.addEventListener("click", closePanel);
  }

  // Click on backdrop overlay to close
  const backdrop = offCanvas.querySelector<HTMLElement>(".e-off-canvas__overlay, .e-off-canvas__backdrop");
  if (backdrop && !backdrop.dataset.codexOffCanvasBackdropBound) {
    backdrop.dataset.codexOffCanvasBackdropBound = "true";
    backdrop.addEventListener("click", closePanel);
  }

  // Esc key to close
  if (!document.body.dataset.codexOffCanvasEscBound) {
    document.body.dataset.codexOffCanvasEscBound = "true";
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closePanel();
      }
    });
  }
}

function setupBlogSearch(root: ParentNode, path: string) {
  if (!path.startsWith("/wpisy")) {
    return;
  }

  const searchWidget = root.querySelector<HTMLElement>(".elementor-widget-search-form");
  const searchForm = searchWidget?.querySelector<HTMLFormElement>("form.elementor-search-form");
  const searchInput = searchWidget?.querySelector<HTMLInputElement>(".elementor-search-form__input");
  const mainPostsWidget =
    Array.from(root.querySelectorAll<HTMLElement>(".elementor-widget-posts"))
      .sort(
        (left, right) =>
          right.querySelectorAll(".elementor-post").length -
          left.querySelectorAll(".elementor-post").length,
      )
      .at(0) ?? null;
  const postsContainer = mainPostsWidget?.querySelector<HTMLElement>(".elementor-posts-container");
  const template = postsContainer?.querySelector<HTMLElement>(".elementor-post");
  const submitControls = searchForm?.querySelectorAll<HTMLElement>(
    "button, input[type='submit'], .elementor-search-form__icon",
  );

  if (!searchWidget || !searchForm || !searchInput || !postsContainer || !template) {
    return;
  }

  const originalHtml = postsContainer.innerHTML;
  const updateSearchUrl = (query: string) => {
    const currentUrl = new URL(window.location.href);
    const normalized = query.trim();

    if (normalized) {
      currentUrl.searchParams.set("s", normalized);
    } else {
      currentUrl.searchParams.delete("s");
    }

    window.history.replaceState({}, "", `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
  };

  searchForm.dataset.analyticsForm = "search";
  searchForm.dataset.analyticsLabel = "Wyszukiwarka wpisow";
  searchForm.setAttribute("action", path);
  searchInput.setAttribute("autocomplete", "off");
  const resultsNotice =
    searchWidget.querySelector<HTMLElement>(".elementor-search-form__results-count") ??
    document.createElement("div");

  resultsNotice.className = "elementor-search-form__results-count";

  if (!resultsNotice.parentElement) {
    searchWidget.append(resultsNotice);
  }

  const runSearch = async (query: string) => {
    const normalized = query.trim();

    if (window.__codexBlogSearchAbort) {
      window.__codexBlogSearchAbort.abort();
    }

    if (!normalized) {
      postsContainer.innerHTML = originalHtml;
      resultsNotice.textContent = "";
      updateSearchUrl("");
      window.dispatchEvent(new Event("codex:aos-refresh"));
      return;
    }

    const controller = new AbortController();
    window.__codexBlogSearchAbort = controller;

    try {
      const response = await fetch(
        `/api/blog-search?q=${encodeURIComponent(normalized)}`,
        { signal: controller.signal },
      );

      if (!response.ok) {
        throw new Error("Search request failed");
      }

      const payload = (await response.json()) as BlogSearchPayload;
      renderSearchResults(postsContainer, template, payload.results);
      resultsNotice.textContent = `Znaleziono ${payload.totalResults} wpis\u00f3w dla: "${normalized}"`;
      updateSearchUrl(payload.query || normalized);
      window.dispatchEvent(
        new CustomEvent("biomasa:site-search", {
          detail: {
            path,
            query: payload.query || normalized,
            resultsCount: payload.results.length,
            totalResults: payload.totalResults,
          },
        }),
      );
      window.dispatchEvent(new Event("codex:aos-refresh"));
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return;
      }

      resultsNotice.textContent = "Nie uda\u0142o si\u0119 pobra\u0107 wynik\u00f3w wyszukiwania.";
    }
  };

  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  if (!searchForm.dataset.codexSearchBound) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      void runSearch(searchInput.value);
    });

    submitControls?.forEach((control) => {
      control.addEventListener("click", (event) => {
        event.preventDefault();
        void runSearch(searchInput.value);
      });
    });

    searchInput.addEventListener("input", () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        void runSearch(searchInput.value);
      }, 220);
    });

    searchInput.addEventListener("change", () => {
      void runSearch(searchInput.value);
    });

    searchInput.addEventListener("search", () => {
      void runSearch(searchInput.value);
    });

    searchForm.dataset.codexSearchBound = "true";
  }

  const initialQuery = new URL(window.location.href).searchParams.get("s");
  if (initialQuery && initialQuery !== searchInput.value) {
    searchInput.value = initialQuery;
    void runSearch(initialQuery);
  }

  if (!searchWidget.dataset.codexSearchWarmed) {
    searchWidget.dataset.codexSearchWarmed = "true";
    void fetch("/api/blog-search?warm=1", { keepalive: true }).catch(() => undefined);
  }
}

export function WordPressInteractiveEnhancer({
  path,
  featuredImage,
  isSinglePost = false,
}: WordPressInteractiveEnhancerProps) {
  useEffect(() => {
    const root = document.querySelector(".wp-mirror-page");

    if (!root) {
      return;
    }

    root.querySelectorAll(".e-con.e-parent").forEach((element) => {
      element.classList.add("e-lazyloaded");
    });

    if (isSinglePost) {
      applyFeaturedImage(root, featuredImage);
      buildTableOfContents(root);
      setupFaq(root);
    }

    setupOffCanvas(root);
    setupBlogSearch(root, path);
    applyAosAttributes(root);
    window.dispatchEvent(new Event("codex:aos-refresh"));
  }, [featuredImage, isSinglePost, path]);

  return null;
}
