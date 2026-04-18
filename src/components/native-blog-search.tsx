"use client";

import { useEffect, useRef, useState } from "react";

type NativeBlogSearchProps = {
  initialValue?: string;
};

export function NativeBlogSearch({
  initialValue = "",
}: NativeBlogSearchProps) {
  const [value, setValue] = useState(initialValue);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

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
            <label className="elementor-screen-only" htmlFor="native-blog-search-input">
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
