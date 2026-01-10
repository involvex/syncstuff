import { useEffect } from "react";
import { useSettingsStore } from "../store/settings.store";
import { localStorageService } from "../services/storage/local-storage.service";
import { STORAGE_KEYS, type ThemeMode } from "../types/storage.types";

/**
 * Hook to manage theme state and persistence
 */
export const useTheme = () => {
  const { theme, setTheme } = useSettingsStore();

  // Load theme from storage on mount
  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await localStorageService.get<ThemeMode>(
        STORAGE_KEYS.THEME,
      );
      if (savedTheme) {
        setTheme(savedTheme);
      }
    };

    loadTheme();
  }, [setTheme]);

  // Apply theme to document
  useEffect(() => {
    const applyTheme = () => {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      const isDark = theme === "dark" || (theme === "system" && prefersDark);

      document.body.classList.toggle("dark", isDark);
    };

    applyTheme();

    // Listen for system theme changes if using 'system' mode
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", applyTheme);
      return () => mediaQuery.removeEventListener("change", applyTheme);
    }
  }, [theme]);

  // Save theme to storage when it changes
  useEffect(() => {
    const saveTheme = async () => {
      await localStorageService.set(STORAGE_KEYS.THEME, theme);
    };

    saveTheme();
  }, [theme]);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  return {
    theme,
    setTheme,
    toggleTheme,
  };
};
