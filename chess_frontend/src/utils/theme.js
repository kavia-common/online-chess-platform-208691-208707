/**
 * Theme utilities for the app.
 * We apply theme via a `data-theme` attribute on the <html> element:
 *   <html data-theme="dark"> ... or ... data-theme="light"
 *
 * This avoids DOM-style manipulation and keeps styling in CSS.
 */

const THEME_KEY = "chess_frontend_theme";

/**
 * Read initial theme from:
 * 1) localStorage (if set),
 * 2) system preference,
 * 3) fallback to "dark" (matches current styling).
 */
function getInitialTheme() {
  const stored = window.localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;

  if (window.matchMedia) {
    try {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      return prefersDark ? "dark" : "light";
    } catch {
      // ignore and fall back
    }
  }

  return "dark";
}

// PUBLIC_INTERFACE
export function applyTheme(theme) {
  /** Apply theme to the document root and persist it. */
  const safeTheme = theme === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", safeTheme);
  window.localStorage.setItem(THEME_KEY, safeTheme);
  return safeTheme;
}

// PUBLIC_INTERFACE
export function getStoredOrPreferredTheme() {
  /** Returns "light" | "dark" from localStorage / system preference. */
  return getInitialTheme();
}
