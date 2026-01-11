"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AvatarFallback = exports.AvatarImage = exports.Avatar = void 0;
const tamagui_1 = require("tamagui");
exports.Avatar = (0, tamagui_1.styled)(tamagui_1.Avatar, {
  name: "Avatar",
  circular: true,
  size: "$4"
});
exports.AvatarImage = (0, tamagui_1.styled)(tamagui_1.Avatar.Image, {
  name: "AvatarImage"
});
exports.AvatarFallback = (0, tamagui_1.styled)(tamagui_1.Avatar.Fallback, {
  name: "AvatarFallback",
  backgroundColor: "$background",
  justifyContent: "center",
  alignItems: "center"
});
//# sourceMappingURL=Avatar.native.js.map