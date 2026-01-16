"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferProgress = TransferProgress;
const jsx_runtime_1 = require("react/jsx-runtime");
const Layouts_1 = require("../Layouts");
const Typography_1 = require("../Typography");
function TransferProgress({ fileName, progress, speed, remainingTime }) {
  return (0, jsx_runtime_1.jsxs)(Layouts_1.YStack, {
    className:
      "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 gap-2",
    children: [
      (0, jsx_runtime_1.jsxs)(Layouts_1.XStack, {
        className: "justify-between",
        children: [
          (0, jsx_runtime_1.jsx)(Typography_1.Text, {
            className: "font-bold truncate max-w-[70%]",
            children: fileName,
          }),
          (0, jsx_runtime_1.jsxs)(Typography_1.Text, {
            className: "text-sm",
            children: [Math.round(progress), "%"],
          }),
        ],
      }),
      (0, jsx_runtime_1.jsx)("div", {
        className:
          "w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden",
        children: (0, jsx_runtime_1.jsx)("div", {
          className: "bg-blue-600 h-full transition-all duration-300 ease-out",
          style: { width: `${Math.max(0, Math.min(100, progress))}%` },
        }),
      }),
      (0, jsx_runtime_1.jsxs)(Layouts_1.XStack, {
        className: "justify-between",
        children: [
          speed &&
            (0, jsx_runtime_1.jsx)(Typography_1.Text, {
              className: "text-xs text-slate-500 dark:text-slate-400",
              children: speed,
            }),
          remainingTime &&
            (0, jsx_runtime_1.jsx)(Typography_1.Text, {
              className: "text-xs text-slate-500 dark:text-slate-400",
              children: remainingTime,
            }),
        ],
      }),
    ],
  });
}
//# sourceMappingURL=TransferProgress.js.map
