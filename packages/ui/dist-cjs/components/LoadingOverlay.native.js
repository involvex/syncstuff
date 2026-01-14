"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadingOverlay = LoadingOverlay;
const jsx_runtime_1 = require("react/jsx-runtime");
const tamagui_1 = require("tamagui");
function LoadingOverlay({ message = "Loading..." }) {
  return (0, jsx_runtime_1.jsx)(tamagui_1.Stack, {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 1000,
    children: (0, jsx_runtime_1.jsxs)(tamagui_1.YStack, {
      alignItems: "center",
      backgroundColor: "$background",
      borderRadius: "$4",
      elevation: "$4",
      padding: "$6",
      space: "$4",
      children: [
        (0, jsx_runtime_1.jsx)(tamagui_1.Spinner, {
          color: "$primary",
          size: "large",
        }),
        (0, jsx_runtime_1.jsx)(tamagui_1.Text, {
          fontWeight: "bold",
          children: message,
        }),
      ],
    }),
  });
}
//# sourceMappingURL=LoadingOverlay.native.js.map
