"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const utils_1 = require("./utils");
exports.Card = react_1.default.forwardRef(
  ({ className, style, ...props }, ref) => {
    const { style: layoutStyle, restProps } = (0, utils_1.extractLayoutProps)(
      props,
    );
    return (0, jsx_runtime_1.jsx)("div", {
      ref: ref,
      className: (0, utils_1.cn)(
        "rounded-lg border bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-50 shadow-sm p-4",
        className,
      ),
      style: { ...layoutStyle, ...style },
      ...restProps,
    });
  },
);
exports.Card.displayName = "Card";
//# sourceMappingURL=Card.js.map
