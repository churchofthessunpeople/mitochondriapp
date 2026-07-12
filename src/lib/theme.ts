export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "mitochondriapp-theme";
export const DEFAULT_THEME: Theme = "dark";

export function isTheme(value: unknown): value is Theme {
  return value === "dark" || value === "light";
}

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(theme);
  root.style.colorScheme = theme;
  root.dataset.theme = theme;
}

/** Inline script: apply theme before paint (default dark). */
export const themeInitScript = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var d=${JSON.stringify(DEFAULT_THEME)};var t=localStorage.getItem(k);if(t!=="light"&&t!=="dark")t=d;var r=document.documentElement;r.classList.remove("dark","light");r.classList.add(t);r.style.colorScheme=t;r.dataset.theme=t;}catch(e){document.documentElement.classList.add(${JSON.stringify(DEFAULT_THEME)});document.documentElement.style.colorScheme=${JSON.stringify(DEFAULT_THEME)};}})();`;
