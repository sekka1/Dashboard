import { useCallback, useLayoutEffect, useState } from "react";

const STORAGE_KEY = "dashboard-theme";

// Dark is the default until the user explicitly picks light.
function readStoredPreference(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "light";
  } catch {
    return true;
  }
}

/**
 * Dark mode preference persisted in localStorage. The `dark` class is applied
 * to <html> only while the calling page is mounted, so other pages are unaffected.
 */
export function useDarkMode() {
  const [isDark, setIsDark] = useState(readStoredPreference);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", isDark);
    return () => root.classList.remove("dark");
  }, [isDark]);

  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
      } catch {
        // Storage unavailable; preference just won't persist.
      }
      return next;
    });
  }, []);

  return { isDark, toggle };
}
