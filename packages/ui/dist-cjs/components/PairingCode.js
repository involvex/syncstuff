"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PairingCode = PairingCode;
const jsx_runtime_1 = require("react/jsx-runtime");
const Layouts_1 = require("../Layouts");
const Typography_1 = require("../Typography");
function PairingCode({ code }) {
  const digits = code.split("");
  return (0, jsx_runtime_1.jsx)(Layouts_1.XStack, {
    className: "justify-center gap-2 p-4",
    children: digits.map((digit, index) =>
      (0, jsx_runtime_1.jsx)(
        "div",
        {
          className:
            "w-10 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md flex items-center justify-center",
          children: (0, jsx_runtime_1.jsx)(Typography_1.Text, {
            className: "text-xl font-bold",
            children: digit,
          }),
        },
        index,
      ),
    ),
  });
}
//# sourceMappingURL=PairingCode.js.map
