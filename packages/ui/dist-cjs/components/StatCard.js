"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatCard = StatCard;
const jsx_runtime_1 = require("react/jsx-runtime");
const Card_1 = require("../Card");
const Layouts_1 = require("../Layouts");
const Typography_1 = require("../Typography");
function StatCard({ title, value, icon, trend }) {
    return ((0, jsx_runtime_1.jsx)(Card_1.Card, { className: "p-4 transition-transform hover:scale-[1.02]", children: (0, jsx_runtime_1.jsxs)(Layouts_1.XStack, { className: "items-center gap-4", children: [icon && ((0, jsx_runtime_1.jsx)("div", { className: "p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 items-center justify-center flex", children: icon })), (0, jsx_runtime_1.jsxs)(Layouts_1.YStack, { className: "flex-1", children: [(0, jsx_runtime_1.jsx)(Typography_1.Text, { className: "text-xs uppercase font-bold text-slate-500 dark:text-slate-400", children: title }), (0, jsx_runtime_1.jsx)(Typography_1.Text, { className: "text-2xl font-bold", children: value }), trend && ((0, jsx_runtime_1.jsxs)(Layouts_1.XStack, { className: "items-center gap-1", children: [(0, jsx_runtime_1.jsx)(Typography_1.Text, { className: trend.positive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400", children: trend.value }), (0, jsx_runtime_1.jsx)(Typography_1.Text, { className: "text-xs text-slate-500 dark:text-slate-400", children: "from last week" })] }))] })] }) }));
}
//# sourceMappingURL=StatCard.js.map