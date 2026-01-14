"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrollView =
  exports.ZStack =
  exports.YStack =
  exports.XStack =
  exports.Stack =
  exports.View =
    void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const utils_1 = require("./utils");
exports.View = react_1.default.forwardRef(
  ({ className, style, ...props }, ref) => {
    const { style: layoutStyle, restProps } = (0, utils_1.extractLayoutProps)(
      props,
    );
    return (0, jsx_runtime_1.jsx)("div", {
      ref: ref,
      className: (0, utils_1.cn)("flex flex-col", className),
      style: { ...layoutStyle, ...style },
      ...restProps,
    });
  },
);
exports.View.displayName = "View";
exports.Stack = exports.View;
exports.XStack = react_1.default.forwardRef(
  ({ className, style, ...props }, ref) => {
    const { style: layoutStyle, restProps } = (0, utils_1.extractLayoutProps)(
      props,
    );
    return (0, jsx_runtime_1.jsx)("div", {
      ref: ref,
      className: (0, utils_1.cn)("flex flex-row", className),
      style: { ...layoutStyle, ...style },
      ...restProps,
    });
  },
);
exports.XStack.displayName = "XStack";
exports.YStack = react_1.default.forwardRef(
  ({ className, style, ...props }, ref) => {
    const { style: layoutStyle, restProps } = (0, utils_1.extractLayoutProps)(
      props,
    );
    return (0, jsx_runtime_1.jsx)("div", {
      ref: ref,
      className: (0, utils_1.cn)("flex flex-col", className),
      style: { ...layoutStyle, ...style },
      ...restProps,
    });
  },
);
exports.YStack.displayName = "YStack";
exports.ZStack = react_1.default.forwardRef(
  ({ className, style, ...props }, ref) => {
    const { style: layoutStyle, restProps } = (0, utils_1.extractLayoutProps)(
      props,
    );
    return (0, jsx_runtime_1.jsx)("div", {
      ref: ref,
      className: (0, utils_1.cn)("relative flex", className),
      style: { ...layoutStyle, ...style },
      ...restProps,
    });
  },
);
exports.ZStack.displayName = "ZStack";
exports.ScrollView = react_1.default.forwardRef(
  ({ className, style, ...props }, ref) => {
    const { style: layoutStyle, restProps } = (0, utils_1.extractLayoutProps)(
      props,
    );
    return (0, jsx_runtime_1.jsx)("div", {
      ref: ref,
      className: (0, utils_1.cn)("overflow-auto flex flex-col", className),
      style: { ...layoutStyle, ...style },
      ...restProps,
    });
  },
);
exports.ScrollView.displayName = "ScrollView";
//# sourceMappingURL=Layouts.js.map
