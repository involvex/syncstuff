import "./_TransferProgress.css";
const _cn6 =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fos- ";
const _cn5 =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fos- ";
const _cn4 =
  "_dsp-flex _ai-stretch _fb-auto _bxs-border-box _pos-relative _mih-0px _miw-0px _fs-0 _fd-row _jc-space-betwe3241 ";
const _cn3 =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fos- ";
const _cn2 =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-nowrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fow-bold _maw-10037 _ox-hidden _oy-hidden _textOverflow-ellipsis ";
const _cn =
  "_dsp-flex _ai-stretch _fb-auto _bxs-border-box _pos-relative _mih-0px _miw-0px _fs-0 _fd-row _jc-space-betwe3241 ";
import React from "react";
import { XStack, YStack, Text, Progress } from "tamagui";
export interface TransferProgressProps {
  fileName: string;
  progress: number; // 0 to 100
  speed?: string;
  remainingTime?: string;
}
export function TransferProgress({
  fileName,
  progress,
  speed,
  remainingTime,
}: TransferProgressProps) {
  return (
    <YStack
      space="$2"
      padding="$3"
      backgroundColor="$background"
      borderRadius="$3"
      borderWidth={1}
      borderColor="$borderColor"
    >
      <div className={_cn}>
        <span className={_cn2}>{fileName}</span>
        <span className={_cn3}>{progress}%</span>
      </div>

      <Progress value={progress} size="$2">
        <Progress.Indicator animation="quick" backgroundColor="$blue10" />
      </Progress>

      <div className={_cn4}>
        {speed && <span className={_cn5}>{speed}</span>}
        {remainingTime && <span className={_cn6}>{remainingTime}</span>}
      </div>
    </YStack>
  );
}
