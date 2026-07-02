"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Spinner = Spinner;
const jsx_runtime_1 = require("react/jsx-runtime");
const utils_1 = require("./utils");
function Spinner({ size = "large", className, ...props }) {
  const sizeClass = size === "small" ? "h-4 w-4" : "h-8 w-8";
  return (0, jsx_runtime_1.jsx)("div", {
    className: (0, utils_1.cn)(
      "animate-spin rounded-full border-2 border-current border-t-transparent text-blue-600 dark:text-blue-500",
      sizeClass,
      className,
    ),
    ...props,
    children: (0, jsx_runtime_1.jsx)("span", {
      className: "sr-only",
      children: "Loading...",
    }),
  });
}
//# sourceMappingURL=Spinner.js.map
