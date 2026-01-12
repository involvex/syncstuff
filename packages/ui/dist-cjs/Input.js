"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Input = void 0;
const tamagui_1 = require("tamagui");
exports.Input = (0, tamagui_1.styled)(tamagui_1.Input, {
    name: "Input",
    borderWidth: 1,
    borderColor: "$borderColor",
    padding: "$3",
    borderRadius: "$4",
    focusStyle: {
        borderColor: "$borderColorFocus",
    },
});
//# sourceMappingURL=Input.js.map