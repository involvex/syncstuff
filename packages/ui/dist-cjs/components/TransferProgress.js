"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TransferProgress = TransferProgress;
const jsx_runtime_1 = require("react/jsx-runtime");
require("./_TransferProgress.css");
const _cn6 = "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fos- ";
const _cn5 = "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fos- ";
const _cn4 = "_dsp-flex _ai-stretch _fb-auto _bxs-border-box _pos-relative _mih-0px _miw-0px _fs-0 _fd-row _jc-space-betwe3241 ";
const _cn3 = "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fos- ";
const _cn2 = "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-nowrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fow-bold _maw-10037 _ox-hidden _oy-hidden _textOverflow-ellipsis ";
const _cn = "_dsp-flex _ai-stretch _fb-auto _bxs-border-box _pos-relative _mih-0px _miw-0px _fs-0 _fd-row _jc-space-betwe3241 ";
const tamagui_1 = require("tamagui");
function TransferProgress({
  fileName,
  progress,
  speed,
  remainingTime
}) {
  return (0, jsx_runtime_1.jsxs)(tamagui_1.YStack, {
    backgroundColor: "$background",
    borderColor: "$borderColor",
    borderRadius: "$3",
    borderWidth: 1,
    padding: "$3",
    space: "$2",
    children: [(0, jsx_runtime_1.jsxs)("div", {
      className: _cn,
      children: [(0, jsx_runtime_1.jsx)("span", {
        className: _cn2,
        children: fileName
      }), (0, jsx_runtime_1.jsxs)("span", {
        className: _cn3,
        children: [progress, "%"]
      })]
    }), (0, jsx_runtime_1.jsx)(tamagui_1.Progress, {
      size: "$2",
      value: progress,
      children: (0, jsx_runtime_1.jsx)(tamagui_1.Progress.Indicator, {
        animation: "quick",
        backgroundColor: "$blue10"
      })
    }), (0, jsx_runtime_1.jsxs)("div", {
      className: _cn4,
      children: [speed && (0, jsx_runtime_1.jsx)("span", {
        className: _cn5,
        children: speed
      }), remainingTime && (0, jsx_runtime_1.jsx)("span", {
        className: _cn6,
        children: remainingTime
      })]
    })]
  });
}
//# sourceMappingURL=TransferProgress.js.map