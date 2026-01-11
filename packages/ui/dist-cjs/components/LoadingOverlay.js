"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LoadingOverlay = LoadingOverlay;
const jsx_runtime_1 = require("react/jsx-runtime");
require("./_LoadingOverlay.css");
const _cn2 = "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fow-bold ";
const _cn = "_dsp-flex _fd-column _fb-auto _bxs-border-box _mih-0px _miw-0px _fs-0 _pos-absolute _t-0px _r-0px _b-0px _l-0px _bg-rgba0000--538295333 _zi-1000 _ai-center _jc-center ";
const tamagui_1 = require("tamagui");
function LoadingOverlay({
  message = "Loading..."
}) {
  return (0, jsx_runtime_1.jsx)("div", {
    className: _cn,
    children: (0, jsx_runtime_1.jsxs)(tamagui_1.YStack, {
      alignItems: "center",
      backgroundColor: "$background",
      borderRadius: "$4",
      elevation: "$4",
      padding: "$6",
      space: "$4",
      children: [(0, jsx_runtime_1.jsx)(tamagui_1.Spinner, {
        color: "$primary",
        size: "large"
      }), (0, jsx_runtime_1.jsx)("span", {
        className: _cn2,
        children: message
      })]
    })
  });
}
//# sourceMappingURL=LoadingOverlay.js.map