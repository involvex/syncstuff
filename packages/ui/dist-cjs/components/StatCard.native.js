"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatCard = StatCard;
const jsx_runtime_1 = require("react/jsx-runtime");
const tamagui_1 = require("tamagui");
const IconFrame = (0, tamagui_1.styled)(tamagui_1.Stack, {
  padding: "$3",
  borderRadius: "$3",
  alignItems: "center",
  justifyContent: "center",
});
function StatCard({ title, value, icon, trend }) {
  return (0, jsx_runtime_1.jsx)(tamagui_1.Card, {
    animation: "quick",
    bordered: true,
    elevate: true,
    hoverStyle: {
      scale: 1,
    },
    padding: "$4",
    scale: 0.98,
    children: (0, jsx_runtime_1.jsxs)(tamagui_1.XStack, {
      alignItems: "center",
      space: "$4",
      children: [
        icon &&
          (0, jsx_runtime_1.jsx)(IconFrame, {
            backgroundColor: "$backgroundFocus",
            children: icon,
          }),
        (0, jsx_runtime_1.jsxs)(tamagui_1.YStack, {
          flex: 1,
          children: [
            (0, jsx_runtime_1.jsx)(tamagui_1.Text, {
              color: "$colorSubtitle",
              fontSize: "$2",
              fontWeight: "bold",
              textTransform: "uppercase",
              children: title,
            }),
            (0, jsx_runtime_1.jsx)(tamagui_1.Text, {
              fontSize: "$6",
              fontWeight: "bold",
              children: value,
            }),
            trend &&
              (0, jsx_runtime_1.jsxs)(tamagui_1.XStack, {
                alignItems: "center",
                space: "$1",
                children: [
                  (0, jsx_runtime_1.jsx)(tamagui_1.Text, {
                    color: trend.positive ? "$green10" : "$red10",
                    fontSize: "$1",
                    children: trend.value,
                  }),
                  (0, jsx_runtime_1.jsx)(tamagui_1.Text, {
                    color: "$colorSubtitle",
                    fontSize: "$1",
                    children: "from last week",
                  }),
                ],
              }),
          ],
        }),
      ],
    }),
  });
}
//# sourceMappingURL=StatCard.native.js.map
