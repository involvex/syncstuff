"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceIcon = DeviceIcon;
const jsx_runtime_1 = require("react/jsx-runtime");
const lucide_icons_1 = require("@tamagui/lucide-icons");
function DeviceIcon({ type, size = 24, color }) {
    switch (type) {
        case "mobile":
            return (0, jsx_runtime_1.jsx)(lucide_icons_1.Smartphone, { color: color, size: size });
        case "tablet":
            return (0, jsx_runtime_1.jsx)(lucide_icons_1.Tablet, { color: color, size: size });
        case "desktop":
            return (0, jsx_runtime_1.jsx)(lucide_icons_1.Monitor, { color: color, size: size });
        case "laptop":
            return (0, jsx_runtime_1.jsx)(lucide_icons_1.Laptop, { color: color, size: size });
        case "tv":
            return (0, jsx_runtime_1.jsx)(lucide_icons_1.Tv, { color: color, size: size });
        case "cli":
            return (0, jsx_runtime_1.jsx)(lucide_icons_1.Terminal, { color: color, size: size });
        default:
            return (0, jsx_runtime_1.jsx)(lucide_icons_1.Smartphone, { color: color, size: size });
    }
}
//# sourceMappingURL=DeviceIcon.native.js.map