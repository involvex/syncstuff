"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Navigation = Navigation;
const jsx_runtime_1 = require("react/jsx-runtime");
const Button_1 = require("../Button");
const Layouts_1 = require("../Layouts");
const ThemeToggle_1 = require("../ThemeToggle");
const Typography_1 = require("../Typography");
function Navigation({ isLoggedIn, onLogin, onSignup, onDashboard, }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-row h-16 items-center justify-between px-4 bg-background border-b border-slate-200 dark:border-slate-800 absolute top-0 left-0 right-0 z-50", children: [(0, jsx_runtime_1.jsx)(Layouts_1.XStack, { className: "items-center gap-2", children: (0, jsx_runtime_1.jsx)(Typography_1.Text, { className: "text-lg font-bold text-foreground", children: "Syncstuff" }) }), (0, jsx_runtime_1.jsxs)(Layouts_1.XStack, { className: "items-center gap-4", children: [(0, jsx_runtime_1.jsxs)(Layouts_1.XStack, { className: "hidden sm:flex gap-4", children: [(0, jsx_runtime_1.jsx)(Typography_1.Text, { className: "font-medium cursor-pointer text-foreground", children: "Features" }), (0, jsx_runtime_1.jsx)(Typography_1.Text, { className: "font-medium cursor-pointer text-foreground", children: "Pricing" }), (0, jsx_runtime_1.jsx)(Typography_1.Text, { className: "font-medium cursor-pointer text-foreground", children: "Docs" })] }), (0, jsx_runtime_1.jsx)(ThemeToggle_1.ThemeToggle, {}), isLoggedIn ? ((0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: onDashboard, className: "bg-blue-600 hover:bg-blue-700 text-white", children: "Dashboard" })) : ((0, jsx_runtime_1.jsxs)(Layouts_1.XStack, { className: "gap-2", children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: onLogin, variant: "outline", children: "Login" }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: onSignup, className: "bg-blue-600 hover:bg-blue-700 text-white", children: "Sign Up" })] }))] })] }));
}
//# sourceMappingURL=Navigation.js.map