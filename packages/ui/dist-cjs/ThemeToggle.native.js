"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ThemeToggle = ThemeToggle;
const jsx_runtime_1 = require("react/jsx-runtime");
const lucide_icons_1 = require("@tamagui/lucide-icons");
const Button_1 = require("./Button");
const provider_1 = require("./provider");
function ThemeToggle() {
  const {
    theme,
    toggleTheme
  } = (0, provider_1.useAppTheme)();
  return (0, jsx_runtime_1.jsx)(Button_1.Button, {
    backgroundColor: "$background",
    circular: true,
    hoverStyle: {
      backgroundColor: "$backgroundHover"
    },
    icon: theme === "light" ? (0, jsx_runtime_1.jsx)(lucide_icons_1.Sun, {}) : (0, jsx_runtime_1.jsx)(lucide_icons_1.Moon, {}),
    onPress: toggleTheme
  });
}
//# sourceMappingURL=ThemeToggle.native.js.map