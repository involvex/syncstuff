"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const clsx_1 = require("clsx");
const react_1 = __importDefault(require("react"));
const tailwind_merge_1 = require("tailwind-merge");
const utils_1 = require("./utils");
function cn(...inputs) {
    return (0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)(inputs));
}
exports.Button = react_1.default.forwardRef(({ className, variant = "default", size = "default", style, onPress, onClick, icon, children, ...props }, ref) => {
    const { style: layoutStyle, restProps } = (0, utils_1.extractLayoutProps)(props);
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ring-offset-background";
    const variants = {
        default: "bg-primary text-on-primary hover:opacity-90",
        destructive: "bg-red-600 text-white hover:bg-red-700 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-900/90",
        outline: "border border-outline-variant bg-background hover:bg-surface-variant hover:text-on-surface-variant",
        secondary: "bg-secondary text-on-secondary hover:bg-secondary/80",
        ghost: "hover:bg-surface-variant hover:text-on-surface-variant",
        outlined: "border border-outline-variant bg-background hover:bg-surface-variant hover:text-on-surface-variant", // Mapped alias
    };
    const sizes = {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        "$2": "h-9 px-3", // Mapped alias
        "$4": "h-10 px-4 py-2", // Mapped alias
    };
    const handleClick = (e) => {
        onClick?.(e);
        onPress?.(e);
    };
    return ((0, jsx_runtime_1.jsxs)("button", { ref: ref, className: cn(baseStyles, variants[variant] || variants.default, sizes[size] || sizes.default, className), style: { ...layoutStyle, ...style }, onClick: handleClick, ...restProps, children: [icon && (0, jsx_runtime_1.jsx)("span", { className: "mr-2", children: icon }), children] }));
});
exports.Button.displayName = "Button";
//# sourceMappingURL=Button.js.map