"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DeviceIcon = DeviceIcon;
const jsx_runtime_1 = require("react/jsx-runtime");
const lucide_react_1 = require("lucide-react");
function DeviceIcon({
  type,
  size = 24,
  color
}) {
  const iconProps = {
    size: Number(size),
    color
  };
  switch (type) {
    case "mobile":
      return (0, jsx_runtime_1.jsx)(lucide_react_1.Smartphone, {
        ...iconProps
      });
    case "tablet":
      return (0, jsx_runtime_1.jsx)(lucide_react_1.Tablet, {
        ...iconProps
      });
    case "desktop":
      return (0, jsx_runtime_1.jsx)(lucide_react_1.Monitor, {
        ...iconProps
      });
    case "laptop":
      return (0, jsx_runtime_1.jsx)(lucide_react_1.Laptop, {
        ...iconProps
      });
    case "tv":
      return (0, jsx_runtime_1.jsx)(lucide_react_1.Tv, {
        ...iconProps
      });
    case "cli":
      return (0, jsx_runtime_1.jsx)(lucide_react_1.Terminal, {
        ...iconProps
      });
    default:
      return (0, jsx_runtime_1.jsx)(lucide_react_1.Smartphone, {
        ...iconProps
      });
  }
}
//# sourceMappingURL=DeviceIcon.js.map