"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TransferProgress = TransferProgress;
const jsx_runtime_1 = require("react/jsx-runtime");
const tamagui_1 = require("tamagui");
function TransferProgress({
  fileName,
  progress,
  speed,
  remainingTime
}) {
  return (0, jsx_runtime_1.jsxs)(tamagui_1.YStack, {
    backgroundColor: "$background",
    borderColor: "$borderColor",
    borderRadius: "$3",
    borderWidth: 1,
    padding: "$3",
    space: "$2",
    children: [(0, jsx_runtime_1.jsxs)(tamagui_1.XStack, {
      justifyContent: "space-between",
      children: [(0, jsx_runtime_1.jsx)(tamagui_1.Text, {
        fontWeight: "bold",
        numberOfLines: 1,
        children: fileName
      }), (0, jsx_runtime_1.jsxs)(tamagui_1.Text, {
        fontSize: "$2",
        children: [progress, "%"]
      })]
    }), (0, jsx_runtime_1.jsx)(tamagui_1.Progress, {
      size: "$2",
      value: progress,
      children: (0, jsx_runtime_1.jsx)(tamagui_1.Progress.Indicator, {
        animation: "quick",
        backgroundColor: "$blue10"
      })
    }), (0, jsx_runtime_1.jsxs)(tamagui_1.XStack, {
      justifyContent: "space-between",
      children: [speed && (0, jsx_runtime_1.jsx)(tamagui_1.Text, {
        color: "$colorSubtitle",
        fontSize: "$1",
        children: speed
      }), remainingTime && (0, jsx_runtime_1.jsx)(tamagui_1.Text, {
        color: "$colorSubtitle",
        fontSize: "$1",
        children: remainingTime
      })]
    })]
  });
}
//# sourceMappingURL=TransferProgress.native.js.map