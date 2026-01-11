"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MainLayout = MainLayout;
const jsx_runtime_1 = require("react/jsx-runtime");
const tamagui_1 = require("tamagui");
const ThemeToggle_1 = require("./ThemeToggle");
function MainLayout({
  children,
  sidebar,
  header,
  title
}) {
  return (0, jsx_runtime_1.jsxs)(tamagui_1.XStack, {
    backgroundColor: "$background",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    children: [sidebar && (0, jsx_runtime_1.jsx)(tamagui_1.YStack, {
      "$sm": {
        display: "none"
      },
      backgroundColor: "$surface",
      borderColor: "$borderColor",
      borderRightWidth: 1,
      width: 280,
      children: sidebar
    }), (0, jsx_runtime_1.jsxs)(tamagui_1.YStack, {
      flex: 1,
      children: [(0, jsx_runtime_1.jsxs)(tamagui_1.XStack, {
        alignItems: "center",
        backgroundColor: "$surface",
        borderBottomWidth: 1,
        borderColor: "$borderColor",
        height: 64,
        justifyContent: "space-between",
        paddingHorizontal: "$4",
        children: [(0, jsx_runtime_1.jsxs)(tamagui_1.XStack, {
          alignItems: "center",
          space: "$4",
          children: [title && (0, jsx_runtime_1.jsx)(tamagui_1.Text, {
            fontSize: "$6",
            fontWeight: "bold",
            children: title
          }), header]
        }), (0, jsx_runtime_1.jsx)(ThemeToggle_1.ThemeToggle, {})]
      }), (0, jsx_runtime_1.jsx)(tamagui_1.ScrollView, {
        flex: 1,
        children: (0, jsx_runtime_1.jsx)(tamagui_1.YStack, {
          marginHorizontal: "auto",
          maxWidth: 1200,
          padding: "$4",
          space: "$4",
          width: "100%",
          children: children
        })
      })]
    })]
  });
}
//# sourceMappingURL=MainLayout.native.js.map