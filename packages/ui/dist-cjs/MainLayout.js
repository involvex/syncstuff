"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MainLayout = MainLayout;
const jsx_runtime_1 = require("react/jsx-runtime");
require("./_MainLayout.css");
const _cn4 = "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fos- _fow-bold ";
const _cn3 = "_dsp-flex _fb-auto _bxs-border-box _pos-relative _mih-0px _miw-0px _fs-0 _fd-row _h-64px _ai-center _jc-space-betwe3241 _pr-t-space-4 _pl-t-space-4 _bbw-1px _btc-borderColor _brc-borderColor _bbc-borderColor _blc-borderColor _bbs-solid ";
const _cn2 = "_dsp-flex _ai-stretch _fb-auto _bxs-border-box _pos-relative _mih-0px _miw-0px _fs-1 _fd-column _fg-1 ";
const _cn = "_dsp-flex _ai-stretch _fb-auto _bxs-border-box _mih-0px _miw-0px _fs-0 _fd-row _pos-absolute _t-0px _r-0px _b-0px _l-0px _bg-background ";
const tamagui_1 = require("tamagui");
const ThemeToggle_1 = require("./ThemeToggle");
function MainLayout({
  children,
  sidebar,
  header,
  title
}) {
  return (0, jsx_runtime_1.jsxs)("div", {
    className: _cn,
    children: [sidebar && (0, jsx_runtime_1.jsx)(tamagui_1.YStack, {
      "$sm": {
        display: "none"
      },
      backgroundColor: "$surface",
      borderColor: "$borderColor",
      borderRightWidth: 1,
      width: 280,
      children: sidebar
    }), (0, jsx_runtime_1.jsxs)("div", {
      className: _cn2,
      children: [(0, jsx_runtime_1.jsxs)("div", {
        className: _cn3,
        children: [(0, jsx_runtime_1.jsxs)(tamagui_1.XStack, {
          alignItems: "center",
          space: "$4",
          children: [title && (0, jsx_runtime_1.jsx)("span", {
            className: _cn4,
            children: title
          }), header]
        }), (0, jsx_runtime_1.jsx)(ThemeToggle_1.ThemeToggle, {})]
      }), (0, jsx_runtime_1.jsx)(tamagui_1.ScrollView, {
        flex: 1,
        children: (0, jsx_runtime_1.jsx)(tamagui_1.YStack, {
          marginHorizontal: "auto",
          maxWidth: 1200,
          padding: "$4",
          space: "$4",
          width: "100%",
          children: children
        })
      })]
    })]
  });
}
//# sourceMappingURL=MainLayout.js.map