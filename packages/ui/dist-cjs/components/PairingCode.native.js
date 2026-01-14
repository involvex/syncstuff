"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PairingCode = PairingCode;
const jsx_runtime_1 = require("react/jsx-runtime");
const tamagui_1 = require("tamagui");
const CodeDigit = (0, tamagui_1.styled)(tamagui_1.Stack, {
  width: 40,
  height: 50,
  backgroundColor: "$background",
  borderWidth: 1,
  borderColor: "$borderColor",
  borderRadius: "$2",
  alignItems: "center",
  justifyContent: "center",
  marginHorizontal: "$1",
});
function PairingCode({ code }) {
  const digits = code.split("");
  return (0, jsx_runtime_1.jsx)(tamagui_1.XStack, {
    justifyContent: "center",
    padding: "$4",
    children: digits.map((digit, index) =>
      (0, jsx_runtime_1.jsx)(
        CodeDigit,
        {
          children: (0, jsx_runtime_1.jsx)(tamagui_1.Text, {
            fontSize: "$6",
            fontWeight: "bold",
            children: digit,
          }),
        },
        index,
      ),
    ),
  });
}
//# sourceMappingURL=PairingCode.native.js.map
