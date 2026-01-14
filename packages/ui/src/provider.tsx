import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within a Provider");
  }
  return context;
};

export interface ProviderProps {
  children: React.ReactNode;
  disableInjectCSS?: boolean; // Kept for compatibility, no-op
  disableRootThemeClass?: boolean; // Kept for compatibility, no-op
}

export function Provider({ children }: ProviderProps) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    // Check system preference
    if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
      setThemeState("dark");
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => (prev === "light" ? "dark" : "light"));
  };

  const setTheme = (val: Theme) => setThemeState(val);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
