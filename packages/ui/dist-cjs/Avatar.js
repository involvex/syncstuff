"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o)
            if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvatarImage = exports.AvatarFallback = exports.Avatar = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const React = __importStar(require("react"));
const utils_1 = require("./utils");
const Avatar = React.forwardRef(({ className, ...props }, ref) =>
  (0, jsx_runtime_1.jsx)("div", {
    ref: ref,
    className: (0, utils_1.cn)(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className,
    ),
    ...props,
  }),
);
exports.Avatar = Avatar;
Avatar.displayName = "Avatar";
const AvatarImage = React.forwardRef(({ className, ...props }, ref) =>
  (0, jsx_runtime_1.jsx)("img", {
    ref: ref,
    className: (0, utils_1.cn)("aspect-square h-full w-full", className),
    ...props,
  }),
);
exports.AvatarImage = AvatarImage;
AvatarImage.displayName = "AvatarImage";
const AvatarFallback = React.forwardRef(({ className, ...props }, ref) =>
  (0, jsx_runtime_1.jsx)("div", {
    ref: ref,
    className: (0, utils_1.cn)(
      "flex h-full w-full items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
      className,
    ),
    ...props,
  }),
);
exports.AvatarFallback = AvatarFallback;
AvatarFallback.displayName = "AvatarFallback";
//# sourceMappingURL=Avatar.js.map
