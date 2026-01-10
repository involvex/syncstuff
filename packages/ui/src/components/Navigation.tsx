import "./_Navigation.css";
const _cn5 =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fow-medium _cur-pointer ";
const _cn4 =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fow-medium _cur-pointer ";
const _cn3 =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fow-medium _cur-pointer ";
const _cn2 =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fos- _fow-bold ";
const _cn =
  "_dsp-flex _fb-auto _bxs-border-box _mih-0px _miw-0px _fs-0 _fd-row _h-64px _ai-center _jc-space-betwe3241 _pr-t-space-4 _pl-t-space-4 _bg-background _bbw-1px _btc-borderColor _brc-borderColor _bbc-borderColor _blc-borderColor _pos-absolute _t-0px _l-0px _r-0px _zi-100 _bbs-solid ";
import React from "react";
import { XStack, Text, Button } from "tamagui";
import { ThemeToggle } from "../ThemeToggle";
export interface NavigationProps {
  isLoggedIn?: boolean;
  onLogin?: () => void;
  onSignup?: () => void;
  onDashboard?: () => void;
}
export function Navigation({
  isLoggedIn,
  onLogin,
  onSignup,
  onDashboard,
}: NavigationProps) {
  return (
    <div className={_cn}>
      <XStack alignItems="center" space="$2">
        <span className={_cn2}>Syncstuff</span>
      </XStack>

      <XStack alignItems="center" space="$4">
        <XStack
          $sm={{
            display: "none",
          }}
          space="$4"
        >
          <span className={_cn3}>Features</span>
          <span className={_cn4}>Pricing</span>
          <span className={_cn5}>Docs</span>
        </XStack>

        <ThemeToggle />

        {isLoggedIn ? (
          <Button theme="blue" size="$3" onPress={onDashboard}>
            Dashboard
          </Button>
        ) : (
          <XStack space="$2">
            <Button variant="outlined" size="$3" onPress={onLogin}>
              Login
            </Button>

            <Button theme="blue" size="$3" onPress={onSignup}>
              Sign Up
            </Button>
          </XStack>
        )}
      </XStack>
    </div>
  );
}
