"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DeviceCard = DeviceCard;
const jsx_runtime_1 = require("react/jsx-runtime");
const tamagui_1 = require("tamagui");
const DeviceIcon_1 = require("../DeviceIcon");
const StatusBadge_1 = require("./StatusBadge");
function DeviceCard({
  name,
  type,
  status,
  lastSeen,
  onConnect,
  onDisconnect
}) {
  return (0, jsx_runtime_1.jsx)(tamagui_1.Card, {
    animation: "quick",
    bordered: true,
    elevate: true,
    hoverStyle: {
      scale: 1
    },
    padding: "$4",
    scale: 0.98,
    children: (0, jsx_runtime_1.jsxs)(tamagui_1.XStack, {
      alignItems: "center",
      space: "$4",
      children: [(0, jsx_runtime_1.jsx)(DeviceIcon_1.DeviceIcon, {
        size: 32,
        type: type
      }), (0, jsx_runtime_1.jsxs)(tamagui_1.YStack, {
        flex: 1,
        space: "$1",
        children: [(0, jsx_runtime_1.jsx)(tamagui_1.Text, {
          fontSize: "$5",
          fontWeight: "bold",
          children: name
        }), (0, jsx_runtime_1.jsxs)(tamagui_1.XStack, {
          alignItems: "center",
          space: "$2",
          children: [(0, jsx_runtime_1.jsx)(StatusBadge_1.StatusBadge, {
            status: status === "online" ? "success" : "neutral",
            children: status.toUpperCase()
          }), lastSeen && (0, jsx_runtime_1.jsxs)(tamagui_1.Text, {
            color: "$colorSubtitle",
            fontSize: "$2",
            children: ["Last seen: ", lastSeen]
          })]
        })]
      }), status === "online" ? (0, jsx_runtime_1.jsx)(tamagui_1.Button, {
        onPress: onDisconnect,
        size: "$3",
        theme: "red",
        children: "Disconnect"
      }) : (0, jsx_runtime_1.jsx)(tamagui_1.Button, {
        onPress: onConnect,
        size: "$3",
        theme: "blue",
        children: "Connect"
      })]
    })
  });
}
//# sourceMappingURL=DeviceCard.native.js.map