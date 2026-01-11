import React, { createContext, useContext, useEffect, useState } from "react";
import { TamaguiProvider, type TamaguiProviderProps, Theme } from "tamagui";
import { tamaguiConfig } from "./tamagui.config";

type ThemeContextType = {
  theme: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark") => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within a ThemeProvider");
  }
  return context;
};

export function Provider({
  children,
  ...rest
}: Omit<TamaguiProviderProps, "config">) {
  const [theme, setThemeState] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Check system preference on mount (client-side only)
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ) {
      setThemeState("dark");
    }
  }, []);

  const toggleTheme = () => {
    setThemeState(prev => (prev === "light" ? "dark" : "light"));
  };

  const setTheme = (val: "light" | "dark") => setThemeState(val);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme={theme} {...rest}>
        <Theme name={theme}>{children}</Theme>
      </TamaguiProvider>
    </ThemeContext.Provider>
  );
}
