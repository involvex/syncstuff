"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
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
exports.Button = react_1.default.forwardRef(
  (
    {
      className,
      variant = "default",
      size = "default",
      style,
      onPress,
      onClick,
      icon,
      children,
      ...props
    },
    ref,
  ) => {
    const { style: layoutStyle, restProps } = (0, utils_1.extractLayoutProps)(
      props,
    );
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50";
    const variantStyles = {
      default: "bg-primary text-onPrimary hover:opacity-90 shadow-sm",
      destructive: "bg-error text-onError hover:opacity-90 shadow-sm",
      outline:
        "border border-primary bg-transparent text-primary hover:bg-primary hover:text-onPrimary",
      secondary: "bg-secondary text-onSecondary hover:opacity-90 shadow-sm",
      ghost: "hover:bg-surface hover:text-onSurface",
    };
    const sizeStyles = {
      default: "h-10 px-4 py-2 rounded-md",
      sm: "h-9 px-3 rounded-sm",
      lg: "h-11 px-8 rounded-lg",
      icon: "h-10 w-10 rounded-full",
    };
    const handleClick = e => {
      onClick?.(e);
      onPress?.(e);
    };
    return (0, jsx_runtime_1.jsxs)("button", {
      ref: ref,
      className: cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className,
      ),
      style: { ...layoutStyle, ...style },
      onClick: handleClick,
      ...restProps,
      children: [
        icon &&
          (0, jsx_runtime_1.jsx)("span", { className: "mr-2", children: icon }),
        children,
      ],
    });
  },
);
exports.Button.displayName = "Button";
//# sourceMappingURL=Button.js.map
