"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Separator = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const utils_1 = require("./utils");
exports.Separator = react_1.default.forwardRef(({ className, style, ...props }, ref) => {
    const { style: layoutStyle, restProps } = (0, utils_1.extractLayoutProps)(props);
    return ((0, jsx_runtime_1.jsx)("div", { ref: ref, className: (0, utils_1.cn)("h-[1px] w-full bg-slate-200 dark:bg-slate-800", className), style: { ...layoutStyle, ...style }, ...restProps }));
});
exports.Separator.displayName = "Separator";
//# sourceMappingURL=Separator.js.map