"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Navigation = Navigation;
const jsx_runtime_1 = require("react/jsx-runtime");
require("./_Navigation.css");
const _cn5 = "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fow-medium _cur-pointer ";
const _cn4 = "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fow-medium _cur-pointer ";
const _cn3 = "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fow-medium _cur-pointer ";
const _cn2 = "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fos- _fow-bold ";
const _cn = "_dsp-flex _fb-auto _bxs-border-box _mih-0px _miw-0px _fs-0 _fd-row _h-64px _ai-center _jc-space-betwe3241 _pr-t-space-4 _pl-t-space-4 _bg-background _bbw-1px _btc-borderColor _brc-borderColor _bbc-borderColor _blc-borderColor _pos-absolute _t-0px _l-0px _r-0px _zi-100 _bbs-solid ";
const tamagui_1 = require("tamagui");
const ThemeToggle_1 = require("../ThemeToggle");
function Navigation({
  isLoggedIn,
  onLogin,
  onSignup,
  onDashboard
}) {
  return (0, jsx_runtime_1.jsxs)("div", {
    className: _cn,
    children: [(0, jsx_runtime_1.jsx)(tamagui_1.XStack, {
      alignItems: "center",
      space: "$2",
      children: (0, jsx_runtime_1.jsx)("span", {
        className: _cn2,
        children: "Syncstuff"
      })
    }), (0, jsx_runtime_1.jsxs)(tamagui_1.XStack, {
      alignItems: "center",
      space: "$4",
      children: [(0, jsx_runtime_1.jsxs)(tamagui_1.XStack, {
        "$sm": {
          display: "none"
        },
        space: "$4",
        children: [(0, jsx_runtime_1.jsx)("span", {
          className: _cn3,
          children: "Features"
        }), (0, jsx_runtime_1.jsx)("span", {
          className: _cn4,
          children: "Pricing"
        }), (0, jsx_runtime_1.jsx)("span", {
          className: _cn5,
          children: "Docs"
        })]
      }), (0, jsx_runtime_1.jsx)(ThemeToggle_1.ThemeToggle, {}), isLoggedIn ? (0, jsx_runtime_1.jsx)(tamagui_1.Button, {
        onPress: onDashboard,
        size: "$3",
        theme: "blue",
        children: "Dashboard"
      }) : (0, jsx_runtime_1.jsxs)(tamagui_1.XStack, {
        space: "$2",
        children: [(0, jsx_runtime_1.jsx)(tamagui_1.Button, {
          onPress: onLogin,
          size: "$3",
          variant: "outlined",
          children: "Login"
        }), (0, jsx_runtime_1.jsx)(tamagui_1.Button, {
          onPress: onSignup,
          size: "$3",
          theme: "blue",
          children: "Sign Up"
        })]
      })]
    })]
  });
}
//# sourceMappingURL=Navigation.js.map