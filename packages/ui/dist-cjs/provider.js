"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAppTheme = void 0;
exports.Provider = Provider;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const ThemeContext = (0, react_1.createContext)(undefined);
const useAppTheme = () => {
    const context = (0, react_1.useContext)(ThemeContext);
    if (!context) {
        throw new Error("useAppTheme must be used within a Provider");
    }
    return context;
};
exports.useAppTheme = useAppTheme;
function Provider({ children }) {
    const [theme, setThemeState] = (0, react_1.useState)("light");
    (0, react_1.useEffect)(() => {
        // Check system preference
        if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
            setThemeState("dark");
        }
    }, []);
    (0, react_1.useEffect)(() => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(theme);
    }, [theme]);
    const toggleTheme = () => {
        setThemeState((prev) => (prev === "light" ? "dark" : "light"));
    };
    const setTheme = (val) => setThemeState(val);
    return ((0, jsx_runtime_1.jsx)(ThemeContext.Provider, { value: { theme, toggleTheme, setTheme }, children: children }));
}
//# sourceMappingURL=provider.js.map