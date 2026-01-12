"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SidebarItem = SidebarItem;
const jsx_runtime_1 = require("react/jsx-runtime");
require("./_SidebarItem.css");
const _cn = "_dsp-flex _ai-stretch _fd-column _fb-auto _bxs-border-box _pos-relative _mih-0px _miw-0px _fs-0 ";
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
function SidebarItem({ icon, label, active, onPress, }) {
    const color = active ? "$primary" : "$color";
    return ((0, jsx_runtime_1.jsxs)(SidebarItemFrame, { active: active, onPress: onPress, children: [icon && (0, jsx_runtime_1.jsx)("div", { className: _cn, children: icon }), (0, jsx_runtime_1.jsx)(tamagui_1.Text, { color: color, fontWeight: active ? "bold" : "normal", children: label })] }));
}
//# sourceMappingURL=SidebarItem.js.map