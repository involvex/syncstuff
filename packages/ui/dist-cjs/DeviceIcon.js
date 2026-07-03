"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceIcon = DeviceIcon;
const lucide_react_1 = require("lucide-react");
const icons = {
  mobile: lucide_react_1.Smartphone,
  tablet: lucide_react_1.Tablet,
  desktop: lucide_react_1.Monitor,
  laptop: lucide_react_1.Laptop,
  tv: lucide_react_1.Tv,
  cli: lucide_react_1.Terminal,
  unknown: lucide_react_1.Smartphone,
};
function DeviceIcon({ type, size = 24, color }) {
  const Icon = icons[type] ?? icons.unknown;
  const props = { size: Number(size), color };
  return Icon(props);
}
//# sourceMappingURL=DeviceIcon.js.map
