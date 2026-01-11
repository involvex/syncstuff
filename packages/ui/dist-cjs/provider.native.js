"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useAppTheme = void 0;
exports.Provider = Provider;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const tamagui_1 = require("tamagui");
const tamagui_config_1 = require("./tamagui.config");
const ThemeContext = (0, react_1.createContext)(undefined);
const useAppTheme = () => {
  const context = (0, react_1.useContext)(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within a ThemeProvider");
  }
  return context;
};
exports.useAppTheme = useAppTheme;
function Provider({
  children,
  ...rest
}) {
  const [theme, setThemeState] = (0, react_1.useState)("light");
  (0, react_1.useEffect)(() => {
    // Check system preference on mount
    if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
      setThemeState("dark");
    }
  }, []);
  const toggleTheme = () => {
    setThemeState(prev => prev === "light" ? "dark" : "light");
  };
  const setTheme = val => setThemeState(val);
  return (0, jsx_runtime_1.jsx)(ThemeContext.Provider, {
    value: {
      theme,
      toggleTheme,
      setTheme
    },
    children: (0, jsx_runtime_1.jsx)(tamagui_1.TamaguiProvider, {
      config: tamagui_config_1.tamaguiConfig,
      defaultTheme: theme,
      ...rest,
      children: (0, jsx_runtime_1.jsx)(tamagui_1.Theme, {
        name: theme,
        children: children
      })
    })
  });
}
//# sourceMappingURL=provider.native.js.map