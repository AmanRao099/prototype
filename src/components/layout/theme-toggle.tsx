"use client";

import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "erp-theme";

/**
 * Dark mode is a selected theme, not an inverted one - the stylesheet carries
 * its own validated steps. The toggle stamps `data-theme` on <html>, which wins
 * over the OS preference in both directions.
 *
 * No React state: the current theme lives on the document, and which icon shows
 * is decided in CSS (`.when-light` / `.when-dark`). That keeps the server and
 * client markup identical, so there is nothing to hydrate and no flash.
 */
export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const current =
      (root.dataset.theme as "light" | "dark" | undefined) ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";

    root.dataset.theme = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // private mode or blocked site data: the theme still applies for this visit
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-lg border border-hairline p-1.5 text-ink-secondary transition-colors hover:bg-surface-2 hover:text-ink"
      aria-label="Toggle light and dark theme"
    >
      <Moon className="when-light size-4" aria-hidden />
      <Sun className="when-dark size-4" aria-hidden />
    </button>
  );
}

/** Runs before paint so a stored theme never flashes the other mode. */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');if(t==='dark'||t==='light'){document.documentElement.dataset.theme=t;}}catch(e){}})();`;
