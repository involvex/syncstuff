"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = void 0;
const tamagui_1 = require("tamagui");
exports.Button = (0, tamagui_1.styled)(tamagui_1.Button, {
  name: "Button",
  backgroundColor: "$background",
  color: "$color",
  hoverStyle: {
    backgroundColor: "$backgroundHover",
  },
  pressStyle: {
    backgroundColor: "$backgroundPress",
  },
});
//# sourceMappingURL=Button.native.js.map
