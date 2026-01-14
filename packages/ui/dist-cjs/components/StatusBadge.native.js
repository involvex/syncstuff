"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusBadge = StatusBadge;
const jsx_runtime_1 = require("react/jsx-runtime");
const tamagui_1 = require("tamagui");
const BadgeFrame = (0, tamagui_1.styled)(tamagui_1.Stack, {
  name: "StatusBadge",
  paddingHorizontal: "$2",
  paddingVertical: "$1",
  borderRadius: "$2",
  alignItems: "center",
  justifyContent: "center",
  variants: {
    status: {
      success: {
        backgroundColor: "$green4",
      },
      warning: {
        backgroundColor: "$yellow4",
      },
      error: {
        backgroundColor: "$red4",
      },
      info: {
        backgroundColor: "$blue4",
      },
      neutral: {
        backgroundColor: "$gray4",
      },
    },
  },
});
const BadgeText = (0, tamagui_1.styled)(tamagui_1.Text, {
  fontSize: "$2",
  fontWeight: "bold",
  variants: {
    status: {
      success: {
        color: "$green10",
      },
      warning: {
        color: "$yellow10",
      },
      error: {
        color: "$red10",
      },
      info: {
        color: "$blue10",
      },
      neutral: {
        color: "$gray10",
      },
    },
  },
});
function StatusBadge({ status, children }) {
  return (0, jsx_runtime_1.jsx)(BadgeFrame, {
    status: status,
    children: (0, jsx_runtime_1.jsx)(BadgeText, {
      status: status,
      children: children,
    }),
  });
}
//# sourceMappingURL=StatusBadge.native.js.map
