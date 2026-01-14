"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeToggle = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const lucide_react_1 = require("lucide-react");
const Button_1 = require("./Button");
const provider_1 = require("./provider");
const ThemeToggle = () => {
  const { theme, toggleTheme } = (0, provider_1.useAppTheme)();
  return (0, jsx_runtime_1.jsx)(Button_1.Button, {
    variant: "ghost",
    onClick: toggleTheme,
    className: "w-10 h-10 p-0 rounded-full",
    "aria-label": "Toggle theme",
    children:
      theme === "dark"
        ? (0, jsx_runtime_1.jsx)(lucide_react_1.Sun, {
            className: "h-5 w-5 text-yellow-500",
          })
        : (0, jsx_runtime_1.jsx)(lucide_react_1.Moon, {
            className: "h-5 w-5 text-slate-700",
          }),
  });
};
exports.ThemeToggle = ThemeToggle;
//# sourceMappingURL=ThemeToggle.js.map
