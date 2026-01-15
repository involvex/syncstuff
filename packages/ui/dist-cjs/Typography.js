"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.H6 = exports.H5 = exports.H4 = exports.H3 = exports.H2 = exports.H1 = exports.Paragraph = exports.Text = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const utils_1 = require("./utils");
exports.Text = react_1.default.forwardRef(({ className, style, ...props }, ref) => {
    const { style: layoutStyle, restProps } = (0, utils_1.extractLayoutProps)(props);
    return ((0, jsx_runtime_1.jsx)("span", { ref: ref, className: (0, utils_1.cn)("text-base text-slate-900 dark:text-slate-100", className), style: { ...layoutStyle, ...style }, ...restProps }));
});
exports.Text.displayName = "Text";
exports.Paragraph = react_1.default.forwardRef(({ className, style, ...props }, ref) => {
    const { style: layoutStyle, restProps } = (0, utils_1.extractLayoutProps)(props);
    return ((0, jsx_runtime_1.jsx)("p", { ref: ref, className: (0, utils_1.cn)("text-base text-slate-900 dark:text-slate-100 mb-2", className), style: { ...layoutStyle, ...style }, ...restProps }));
});
exports.Paragraph.displayName = "Paragraph";
exports.H1 = react_1.default.forwardRef(({ className, style, ...props }, ref) => {
    const { style: layoutStyle, restProps } = (0, utils_1.extractLayoutProps)(props);
    return ((0, jsx_runtime_1.jsx)("h1", { ref: ref, className: (0, utils_1.cn)("scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-slate-900 dark:text-slate-100", className), style: { ...layoutStyle, ...style }, ...restProps }));
});
exports.H1.displayName = "H1";
exports.H2 = react_1.default.forwardRef(({ className, style, ...props }, ref) => {
    const { style: layoutStyle, restProps } = (0, utils_1.extractLayoutProps)(props);
    return ((0, jsx_runtime_1.jsx)("h2", { ref: ref, className: (0, utils_1.cn)("scroll-m-20 border-b border-slate-200 dark:border-slate-800 pb-2 text-3xl font-semibold tracking-tight first:mt-0 text-slate-900 dark:text-slate-100", className), style: { ...layoutStyle, ...style }, ...restProps }));
});
exports.H2.displayName = "H2";
exports.H3 = react_1.default.forwardRef(({ className, style, ...props }, ref) => {
    const { style: layoutStyle, restProps } = (0, utils_1.extractLayoutProps)(props);
    return ((0, jsx_runtime_1.jsx)("h3", { ref: ref, className: (0, utils_1.cn)("scroll-m-20 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100", className), style: { ...layoutStyle, ...style }, ...restProps }));
});
exports.H3.displayName = "H3";
exports.H4 = react_1.default.forwardRef(({ className, style, ...props }, ref) => {
    const { style: layoutStyle, restProps } = (0, utils_1.extractLayoutProps)(props);
    return ((0, jsx_runtime_1.jsx)("h4", { ref: ref, className: (0, utils_1.cn)("scroll-m-20 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100", className), style: { ...layoutStyle, ...style }, ...restProps }));
});
exports.H4.displayName = "H4";
exports.H5 = react_1.default.forwardRef(({ className, style, ...props }, ref) => {
    const { style: layoutStyle, restProps } = (0, utils_1.extractLayoutProps)(props);
    return ((0, jsx_runtime_1.jsx)("h5", { ref: ref, className: (0, utils_1.cn)("scroll-m-20 text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100", className), style: { ...layoutStyle, ...style }, ...restProps }));
});
exports.H5.displayName = "H5";
exports.H6 = react_1.default.forwardRef(({ className, style, ...props }, ref) => {
    const { style: layoutStyle, restProps } = (0, utils_1.extractLayoutProps)(props);
    return ((0, jsx_runtime_1.jsx)("h6", { ref: ref, className: (0, utils_1.cn)("scroll-m-20 text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100", className), style: { ...layoutStyle, ...style }, ...restProps }));
});
exports.H6.displayName = "H6";
//# sourceMappingURL=Typography.js.map