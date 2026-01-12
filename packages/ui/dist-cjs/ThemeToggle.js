"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeToggle = ThemeToggle;
const jsx_runtime_1 = require("react/jsx-runtime");
const lucide_react_1 = require("lucide-react");
const Button_1 = require("./Button");
const provider_1 = require("./provider");
function ThemeToggle() {
    const { theme, toggleTheme } = (0, provider_1.useAppTheme)();
    return ((0, jsx_runtime_1.jsx)(Button_1.Button, { backgroundColor: "$background", circular: true, hoverStyle: { backgroundColor: "$backgroundHover" }, icon: theme === "light" ? (0, jsx_runtime_1.jsx)(lucide_react_1.Sun, { size: 20 }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Moon, { size: 20 }), onPress: toggleTheme }));
}
//# sourceMappingURL=ThemeToggle.js.map