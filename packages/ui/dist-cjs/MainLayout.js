"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainLayout = MainLayout;
const jsx_runtime_1 = require("react/jsx-runtime");
const Layouts_1 = require("./Layouts");
const ThemeToggle_1 = require("./ThemeToggle");
function MainLayout({ children, sidebar, header, title, }) {
    return ((0, jsx_runtime_1.jsxs)(Layouts_1.View, { className: "flex flex-row absolute inset-0 bg-background overflow-hidden", children: [sidebar && ((0, jsx_runtime_1.jsx)(Layouts_1.YStack, { className: "hidden sm:flex border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 w-[280px]", children: sidebar })), (0, jsx_runtime_1.jsxs)(Layouts_1.View, { className: "flex-1 flex flex-col relative overflow-hidden", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-row h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 shrink-0", children: [(0, jsx_runtime_1.jsxs)(Layouts_1.XStack, { className: "items-center gap-4", children: [title && ((0, jsx_runtime_1.jsx)("span", { className: "font-bold text-lg text-foreground", children: title })), header] }), (0, jsx_runtime_1.jsx)(ThemeToggle_1.ThemeToggle, {})] }), (0, jsx_runtime_1.jsx)(Layouts_1.ScrollView, { className: "flex-1", children: (0, jsx_runtime_1.jsx)(Layouts_1.YStack, { className: "mx-auto w-full max-w-[1200px] p-4 gap-4", children: children }) })] })] }));
}
//# sourceMappingURL=MainLayout.js.map