import "./_Footer.css";
const _cn16 =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fos- ";
const _cn15 =
  "_dsp-flex _fb-auto _bxs-border-box _pos-relative _mih-0px _miw-0px _fs-0 _fd-row _jc-space-betwe3241 _ai-center ";
const _cn14 =
  "is_Separator _dsp-flex _ai-stretch _fd-column _fb-auto _bxs-border-box _pos-relative _mih-0px _miw-0px _btc-borderColor _brc-borderColor _bbc-borderColor _blc-borderColor _fs-1 _btw-0px _brw-0px _bbw-1px _blw-0px _fg-1 _h-0px _mah-0px _bbs-solid _bts-solid _bls-solid _brs-solid _tr-translateY-1736186894 ";
const _cn13 =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color ";
const _cn12 =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color ";
const _cn11 =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fow-bold ";
const _cn10 =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color ";
const _cn1 =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color ";
const _cn0 =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color ";
const _cn9 =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color ";
const _cn8 =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fow-bold ";
const _cn7 =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color ";
const _cn6 =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color ";
const _cn5 =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color ";
const _cn4 =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color ";
const _cn3 =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fow-bold ";
const _cn2 =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color ";
const _cn =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fos- _fow-bold ";

import React from "react";
import { Separator, Text, XStack, YStack } from "tamagui";
export function Footer() {
  return (
    <YStack
      backgroundColor="$background"
      borderColor="$borderColor"
      borderTopWidth={1}
      paddingHorizontal="$4"
      paddingVertical="$8"
      space="$4"
    >
      <XStack flexWrap="wrap" justifyContent="space-between" space="$4">
        <YStack minWidth={200} space="$2">
          <span className={_cn}>Syncstuff</span>
          <span className={_cn2}>
            Synchronize your files and clipboard across all your devices.
          </span>
        </YStack>

        <XStack flexWrap="wrap" space="$8">
          <YStack space="$2">
            <span className={_cn3}>Product</span>
            <span className={_cn4}>Features</span>
            <span className={_cn5}>Downloads</span>
            <span className={_cn6}>Premium</span>
            <span className={_cn7}>Campaigns</span>
          </YStack>

          <YStack space="$2">
            <span className={_cn8}>Company</span>
            <span className={_cn9}>About</span>
            <span className={_cn0}>Blog</span>
            <span className={_cn1}>FAQ</span>
            <span className={_cn10}>Contact</span>
          </YStack>

          <YStack space="$2">
            <span className={_cn11}>Legal</span>
            <span className={_cn12}>Privacy</span>
            <span className={_cn13}>Terms</span>
          </YStack>
        </XStack>
      </XStack>

      <div className={_cn14} />

      <div className={_cn15}>
        <span className={_cn16}>
          © {new Date().getFullYear()} Involvex. All rights reserved.
        </span>
        <XStack space="$4">{/* Social icons could go here */}</XStack>
      </div>
    </YStack>
  );
}
