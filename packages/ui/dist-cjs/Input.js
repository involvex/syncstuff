"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.Input = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const utils_1 = require("./utils");
exports.Input = react_1.default.forwardRef(
  ({ className, style, ...props }, ref) => {
    const { style: layoutStyle, restProps } = (0, utils_1.extractLayoutProps)(
      props,
    );
    return (0, jsx_runtime_1.jsx)("input", {
      ref: ref,
      className: (0, utils_1.cn)(
        "flex h-10 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-50 dark:placeholder:text-gray-400",
        className,
      ),
      style: { ...layoutStyle, ...style },
      ...restProps,
    });
  },
);
exports.Input.displayName = "Input";
//# sourceMappingURL=Input.js.map
