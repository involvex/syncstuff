"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Navigation = Navigation;
const jsx_runtime_1 = require("react/jsx-runtime");
const tamagui_1 = require("tamagui");
const ThemeToggle_1 = require("../ThemeToggle");
function Navigation({ isLoggedIn, onLogin, onSignup, onDashboard }) {
  return (0, jsx_runtime_1.jsxs)(tamagui_1.XStack, {
    alignItems: "center",
    backgroundColor: "$background",
    borderBottomWidth: 1,
    borderColor: "$borderColor",
    height: 64,
    justifyContent: "space-between",
    left: 0,
    paddingHorizontal: "$4",
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 100,
    children: [
      (0, jsx_runtime_1.jsx)(tamagui_1.XStack, {
        alignItems: "center",
        space: "$2",
        children: (0, jsx_runtime_1.jsx)(tamagui_1.Text, {
          color: "$primary",
          fontSize: "$6",
          fontWeight: "bold",
          children: "Syncstuff",
        }),
      }),
      (0, jsx_runtime_1.jsxs)(tamagui_1.XStack, {
        alignItems: "center",
        space: "$4",
        children: [
          (0, jsx_runtime_1.jsxs)(tamagui_1.XStack, {
            $sm: {
              display: "none",
            },
            space: "$4",
            children: [
              (0, jsx_runtime_1.jsx)(tamagui_1.Text, {
                cursor: "pointer",
                fontWeight: "medium",
                hoverStyle: {
                  color: "$primary",
                },
                children: "Features",
              }),
              (0, jsx_runtime_1.jsx)(tamagui_1.Text, {
                cursor: "pointer",
                fontWeight: "medium",
                hoverStyle: {
                  color: "$primary",
                },
                children: "Pricing",
              }),
              (0, jsx_runtime_1.jsx)(tamagui_1.Text, {
                cursor: "pointer",
                fontWeight: "medium",
                hoverStyle: {
                  color: "$primary",
                },
                children: "Docs",
              }),
            ],
          }),
          (0, jsx_runtime_1.jsx)(ThemeToggle_1.ThemeToggle, {}),
          isLoggedIn
            ? (0, jsx_runtime_1.jsx)(tamagui_1.Button, {
                onPress: onDashboard,
                size: "$3",
                theme: "blue",
                children: "Dashboard",
              })
            : (0, jsx_runtime_1.jsxs)(tamagui_1.XStack, {
                space: "$2",
                children: [
                  (0, jsx_runtime_1.jsx)(tamagui_1.Button, {
                    onPress: onLogin,
                    size: "$3",
                    variant: "outlined",
                    children: "Login",
                  }),
                  (0, jsx_runtime_1.jsx)(tamagui_1.Button, {
                    onPress: onSignup,
                    size: "$3",
                    theme: "blue",
                    children: "Sign Up",
                  }),
                ],
              }),
        ],
      }),
    ],
  });
}
//# sourceMappingURL=Navigation.native.js.map
