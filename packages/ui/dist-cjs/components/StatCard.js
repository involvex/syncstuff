"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StatCard = StatCard;
const jsx_runtime_1 = require("react/jsx-runtime");
require("./_StatCard.css");
const _cn7 = "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fos- ";
const _cn6 = "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fos- ";
const _cn5 = "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _fos- _col-green10 ";
const _cn4 = "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _fos- _col-red10 ";
const _cn3 = "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fos- _fow-bold ";
const _cn2 = "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fos- _tt-uppercase _fow-bold ";
const _cn = "_dsp-flex _ai-stretch _fb-auto _bxs-border-box _pos-relative _mih-0px _miw-0px _fs-1 _fd-column _fg-1 ";
const tamagui_1 = require("tamagui");
const IconFrame = (0, tamagui_1.styled)(tamagui_1.Stack, {
  padding: "$3",
  borderRadius: "$3",
  alignItems: "center",
  justifyContent: "center"
});
function StatCard({
  title,
  value,
  icon,
  trend
}) {
  return (0, jsx_runtime_1.jsx)(tamagui_1.Card, {
    animation: "quick",
    bordered: true,
    elevate: true,
    hoverStyle: {
      scale: 1
    },
    padding: "$4",
    scale: 0.98,
    children: (0, jsx_runtime_1.jsxs)(tamagui_1.XStack, {
      alignItems: "center",
      space: "$4",
      children: [icon && (0, jsx_runtime_1.jsx)(IconFrame, {
        backgroundColor: "$backgroundFocus",
        children: icon
      }), (0, jsx_runtime_1.jsxs)("div", {
        className: _cn,
        children: [(0, jsx_runtime_1.jsx)("span", {
          className: _cn2,
          children: title
        }), (0, jsx_runtime_1.jsx)("span", {
          className: _cn3,
          children: value
        }), trend && (0, jsx_runtime_1.jsxs)(tamagui_1.XStack, {
          alignItems: "center",
          space: "$1",
          children: [(0, jsx_runtime_1.jsx)("span", {
            className: !trend.positive ? _cn4 : trend.positive ? _cn5 : _cn6,
            children: trend.value
          }), (0, jsx_runtime_1.jsx)("span", {
            className: _cn7,
            children: "from last week"
          })]
        })]
      })]
    })
  });
}
//# sourceMappingURL=StatCard.js.map