import "./_LoadingOverlay.css";
const _cn2 =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fow-bold ";
const _cn =
  "_dsp-flex _fd-column _fb-auto _bxs-border-box _mih-0px _miw-0px _fs-0 _pos-absolute _t-0px _r-0px _b-0px _l-0px _bg-rgba0000--538295333 _zi-1000 _ai-center _jc-center ";

import React from "react";
import { Spinner, YStack } from "tamagui";
export interface LoadingOverlayProps {
  message?: string;
}
export function LoadingOverlay({
  message = "Loading...",
}: LoadingOverlayProps) {
  return (
    <div className={_cn}>
      <YStack
        alignItems="center"
        backgroundColor="$background"
        borderRadius="$4"
        elevation="$4"
        padding="$6"
        space="$4"
      >
        <Spinner color="$primary" size="large" />
        <span className={_cn2}>{message}</span>
      </YStack>
    </div>
  );
}
