"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceCard = DeviceCard;
const jsx_runtime_1 = require("react/jsx-runtime");
const Button_1 = require("../Button");
const Card_1 = require("../Card");
const DeviceIcon_1 = require("../DeviceIcon");
const Layouts_1 = require("../Layouts");
const Typography_1 = require("../Typography");
const StatusBadge_1 = require("./StatusBadge");
function DeviceCard({ name, type, status, lastSeen, onConnect, onDisconnect, }) {
    return ((0, jsx_runtime_1.jsx)(Card_1.Card, { className: "p-4 transition-transform hover:scale-[1.02]", children: (0, jsx_runtime_1.jsxs)(Layouts_1.XStack, { className: "items-center gap-4", children: [(0, jsx_runtime_1.jsx)(DeviceIcon_1.DeviceIcon, { size: 32, type: type }), (0, jsx_runtime_1.jsxs)(Layouts_1.YStack, { className: "flex-1 gap-1", children: [(0, jsx_runtime_1.jsx)(Typography_1.Text, { className: "font-bold text-base", children: name }), (0, jsx_runtime_1.jsxs)(Layouts_1.XStack, { className: "items-center gap-2", children: [(0, jsx_runtime_1.jsx)(StatusBadge_1.StatusBadge, { status: status === "online" ? "success" : "neutral", children: status.toUpperCase() }), lastSeen && (0, jsx_runtime_1.jsxs)(Typography_1.Text, { className: "text-xs text-slate-500 dark:text-slate-400", children: ["Last seen: ", lastSeen] })] })] }), status === "online" ? ((0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: onDisconnect, className: "bg-red-600 hover:bg-red-700 text-white", children: "Disconnect" })) : ((0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: onConnect, className: "bg-blue-600 hover:bg-blue-700 text-white", children: "Connect" }))] }) }));
}
//# sourceMappingURL=DeviceCard.js.map