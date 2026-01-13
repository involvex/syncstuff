"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SidebarItem = SidebarItem;
const jsx_runtime_1 = require("react/jsx-runtime");
const Typography_1 = require("../Typography");
const utils_1 = require("../utils");
function SidebarItem({ icon, label, active, onClick, }) {
    return ((0, jsx_runtime_1.jsxs)("div", { onClick: onClick, className: (0, utils_1.cn)("flex flex-row items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors", "hover:bg-slate-100 dark:hover:bg-slate-800", active && "bg-blue-50 dark:bg-blue-900/20"), children: [icon && (0, jsx_runtime_1.jsx)("div", { className: "shrink-0 text-slate-500 dark:text-slate-400", children: icon }), (0, jsx_runtime_1.jsx)(Typography_1.Text, { className: (0, utils_1.cn)(active ? "font-bold text-blue-600 dark:text-blue-400" : "font-normal text-slate-700 dark:text-slate-300"), children: label })] }));
}
//# sourceMappingURL=SidebarItem.js.map