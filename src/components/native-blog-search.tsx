"use client";

import { useEffect, useRef, useState } from "react";

type NativeBlogSearchProps = {
  initialValue?: string;
};

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

declare global {
  interface Window {
    __codexBlogSearchAbort?: AbortController;
  }
}

export function NativeBlogSearch({
  initialValue = "",
}: NativeBlogSearchProps) {
  const [value, setValue] = useState(initialValue);
  const formRef = useRef<HTMLFormElement | null>(null);
  const warmRef = useRef(false);
  const valueRef = useRef(initialValue);

  useEffect(() => {
    setValue(initialValue);
    valueRef.current = initialValue;
  }, [initialValue]);

  useEffect(() => {
    const searchForm = formRef.current;
    if (!searchForm) {
      return;
    }

    const searchWidget = searchForm.closest<HTMLElement>(".native-blog-search");
    const postsWidget =
      Array.from(
        document.querySelectorAll<HTMLElement>(".elementor-widget-posts"),
      ).sort(
        (left, right) =>
          right.querySelectorAll(".elementor-post").length -
          left.querySelectorAll(".elementor-post").length,
      )[0] ?? null;
    const postsContainer =
      postsWidget?.querySelector<HTMLElement>(".elementor-posts-container") ??
      null;
    const template =
      postsContainer?.querySelector<HTMLElement>(".elementor-post") ?? null;
    const resultsNotice =
      searchWidget?.querySelector<HTMLElement>(
        ".elementor-search-form__results-count",
      ) ?? null;

    if (!searchWidget || !postsContainer || !template || !resultsNotice) {
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

      window.history.replaceState(
        {},
        "",
        `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`,
      );
    };

    const renderSearchResults = (results: BlogSearchResult[]) => {
      if (results.length === 0) {
        postsContainer.innerHTML =
          '<div class="elementor-search-form__empty">Brak wpisów pasujących do wyszukiwania.</div>';
        return;
      }

      postsContainer.innerHTML = "";

      for (const result of results) {
        const article = template.cloneNode(true) as HTMLElement;
        const links = article.querySelectorAll<HTMLAnchorElement>("a[href]");

        links.forEach((link) => {
          link.href = result.path;
        });

        const titleLink = article.querySelector<HTMLAnchorElement>(
          ".elementor-post__title a",
        );
        if (titleLink) {
          titleLink.textContent = result.title;
          titleLink.href = result.path;
        }

        const excerpt = article.querySelector<HTMLElement>(
          ".elementor-post__excerpt p",
        );
        if (excerpt) {
          excerpt.textContent = result.excerpt;
        }

        const imageLink = article.querySelector<HTMLElement>(
          ".elementor-post__thumbnail__link",
        );
        const image = article.querySelector<HTMLImageElement>(
          ".elementor-post__thumbnail img",
        );

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

        postsContainer.append(article);
      }
    };

    const runSearch = async (query: string) => {
      const normalized = query.trim();

      if (window.__codexBlogSearchAbort) {
        window.__codexBlogSearchAbort.abort();
      }

      if (!normalized) {
        postsContainer.innerHTML = originalHtml;
        resultsNotice.textContent = "";
        updateSearchUrl("");
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
        renderSearchResults(payload.results);
        resultsNotice.textContent = `Znaleziono ${payload.totalResults} wpisów dla: "${payload.query || normalized}"`;
        updateSearchUrl(payload.query || normalized);
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }

        resultsNotice.textContent =
          "Nie udało się pobrać wyników wyszukiwania.";
      }
    };

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const onSubmit = (event: Event) => {
      event.preventDefault();
      void runSearch(searchInput?.value ?? valueRef.current);
    };

    const onInput = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const nextValue = target.value;
      setValue(nextValue);
      valueRef.current = nextValue;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        void runSearch(nextValue);
      }, 220);
    };

    const searchInput = searchForm.querySelector<HTMLInputElement>(
      ".elementor-search-form__input",
    );
    const onChange = () => {
      void runSearch(searchInput?.value ?? valueRef.current);
    };
    const onSearch = () => {
      void runSearch(searchInput?.value ?? valueRef.current);
    };

    searchForm.addEventListener("submit", onSubmit);
    searchInput?.addEventListener("input", onInput);
    searchInput?.addEventListener("change", onChange);
    searchInput?.addEventListener("search", onSearch);

    const initialQuery = new URL(window.location.href).searchParams.get("s");
    if (initialQuery && initialQuery !== valueRef.current) {
      setValue(initialQuery);
      valueRef.current = initialQuery;
      void runSearch(initialQuery);
    }

    if (!warmRef.current) {
      warmRef.current = true;
      void fetch("/api/blog-search?warm=1", { keepalive: true }).catch(
        () => undefined,
      );
    }

    return () => {
      searchForm.removeEventListener("submit", onSubmit);
      searchInput?.removeEventListener("input", onInput);
      searchInput?.removeEventListener("change", onChange);
      searchInput?.removeEventListener("search", onSearch);

      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <div className="native-blog-search elementor-widget elementor-widget-search-form">
      <div className="elementor-widget-container">
        <form
          ref={formRef}
          className="elementor-search-form"
          role="search"
          action="/wpisy/"
        >
          <div className="elementor-search-form__container">
            <label
              className="elementor-screen-only"
              htmlFor="native-blog-search-input"
            >
              Wyszukaj wpis
            </label>
            <input
              id="native-blog-search-input"
              className="elementor-search-form__input"
              type="search"
              name="s"
              placeholder="Szukaj we wpisach..."
              value={value}
              onChange={(event) => setValue(event.target.value)}
              autoComplete="off"
            />
            <button className="elementor-search-form__submit" type="submit">
              Szukaj
            </button>
          </div>
        </form>
        <div className="elementor-search-form__results-count" />
      </div>
    </div>
  );
}
