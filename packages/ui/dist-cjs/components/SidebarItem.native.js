"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SidebarItem = SidebarItem;
const jsx_runtime_1 = require("react/jsx-runtime");
const tamagui_1 = require("tamagui");
const SidebarItemFrame = (0, tamagui_1.styled)(tamagui_1.XStack, {
  paddingHorizontal: "$4",
  paddingVertical: "$3",
  borderRadius: "$4",
  space: "$3",
  alignItems: "center",
  cursor: "pointer",
  hoverStyle: {
    backgroundColor: "$backgroundHover",
  },
  pressStyle: {
    backgroundColor: "$backgroundPress",
  },
  variants: {
    active: {
      true: {
        backgroundColor: "$backgroundFocus",
      },
    },
  },
});
function SidebarItem({ icon, label, active, onPress }) {
  const color = active ? "$primary" : "$color";
  return (0, jsx_runtime_1.jsxs)(SidebarItemFrame, {
    active: active,
    onPress: onPress,
    children: [
      icon && (0, jsx_runtime_1.jsx)(tamagui_1.View, { children: icon }),
      (0, jsx_runtime_1.jsx)(tamagui_1.Text, {
        color: color,
        fontWeight: active ? "bold" : "normal",
        children: label,
      }),
    ],
  });
}
//# sourceMappingURL=SidebarItem.native.js.map
