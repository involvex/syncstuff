"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Switch = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const React = __importStar(require("react"));
const utils_1 = require("./utils");
const SwitchComponent = React.forwardRef(({ className, checked, onCheckedChange, style, size, ...props }, ref) => {
    const { style: layoutStyle, restProps } = (0, utils_1.extractLayoutProps)(props);
    return ((0, jsx_runtime_1.jsx)("button", { type: "button", role: "switch", "aria-checked": checked, ref: ref, onClick: () => onCheckedChange?.(!checked), className: (0, utils_1.cn)("peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50", checked ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700", className), style: { ...layoutStyle, ...style }, ...restProps, children: (0, jsx_runtime_1.jsx)("span", { className: (0, utils_1.cn)("pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform", checked ? "translate-x-5" : "translate-x-0") }) }));
});
SwitchComponent.displayName = "Switch";
exports.Switch = Object.assign(SwitchComponent, {
    Thumb: (_) => null // Shim for sub-component usage
});
//# sourceMappingURL=Switch.js.map