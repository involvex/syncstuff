"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PairingCode = PairingCode;
const jsx_runtime_1 = require("react/jsx-runtime");
require("./_PairingCode.css");
const _cn2 = "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fos- _fow-bold ";
const _cn = "_dsp-flex _ai-stretch _fb-auto _bxs-border-box _pos-relative _mih-0px _miw-0px _fs-0 _fd-row _jc-center _pt-t-space-4 _pr-t-space-4 _pb-t-space-4 _pl-t-space-4 ";
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
  marginHorizontal: "$1"
});
function PairingCode({
  code
}) {
  const digits = code.split("");
  return (0, jsx_runtime_1.jsx)("div", {
    className: _cn,
    children: digits.map((digit, index) => (0, jsx_runtime_1.jsx)(CodeDigit, {
      children: (0, jsx_runtime_1.jsx)("span", {
        className: _cn2,
        children: digit
      })
    }, index))
  });
}
//# sourceMappingURL=PairingCode.js.map