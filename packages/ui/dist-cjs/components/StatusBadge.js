"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusBadge = StatusBadge;
const jsx_runtime_1 = require("react/jsx-runtime");
const utils_1 = require("../utils");
const styles = {
    success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    neutral: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};
function StatusBadge({ status, children }) {
    return ((0, jsx_runtime_1.jsx)("div", { className: (0, utils_1.cn)("px-2 py-1 rounded-md flex items-center justify-center font-bold text-xs", styles[status]), children: children }));
}
//# sourceMappingURL=StatusBadge.js.map