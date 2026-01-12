"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Switch = void 0;
const tamagui_1 = require("tamagui");
// Using explicit any type assertions to handle Bun/TypeScript module resolution quirks with Tamagui
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SwitchFrame = (0, tamagui_1.styled)(tamagui_1.Switch, {
    name: "Switch",
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SwitchThumb = (0, tamagui_1.styled)(tamagui_1.Switch.Thumb, {
    name: "SwitchThumb",
    backgroundColor: "$background",
});
// Re-export with Thumb subcomponent
exports.Switch = Object.assign(SwitchFrame, {
    Thumb: SwitchThumb,
});
//# sourceMappingURL=Switch.js.map