"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadingOverlay = LoadingOverlay;
const jsx_runtime_1 = require("react/jsx-runtime");
const Layouts_1 = require("../Layouts");
const Spinner_1 = require("../Spinner");
const Typography_1 = require("../Typography");
function LoadingOverlay({ message = "Loading...", }) {
    return ((0, jsx_runtime_1.jsx)("div", { className: "flex flex-col absolute inset-0 bg-black/50 z-50 items-center justify-center", children: (0, jsx_runtime_1.jsxs)(Layouts_1.YStack, { className: "items-center bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 gap-4", children: [(0, jsx_runtime_1.jsx)(Spinner_1.Spinner, { size: "large" }), (0, jsx_runtime_1.jsx)(Typography_1.Text, { className: "font-bold text-lg", children: message })] }) }));
}
//# sourceMappingURL=LoadingOverlay.js.map