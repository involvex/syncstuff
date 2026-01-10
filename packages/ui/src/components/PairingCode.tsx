import "./_PairingCode.css";
const _cn2 =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fos- _fow-bold ";
const _cn =
  "_dsp-flex _ai-stretch _fb-auto _bxs-border-box _pos-relative _mih-0px _miw-0px _fs-0 _fd-row _jc-center _pt-t-space-4 _pr-t-space-4 _pb-t-space-4 _pl-t-space-4 ";
import React from "react";
import { XStack, Text, styled, Stack } from "tamagui";
export interface PairingCodeProps {
  code: string;
}
const CodeDigit = styled(Stack, {
  width: 40,
  height: 50,
  backgroundColor: "$background",
  borderWidth: 1,
  borderColor: "$borderColor",
  borderRadius: "$2",
  alignItems: "center",
  justifyContent: "center",
  marginHorizontal: "$1",
});
export function PairingCode({ code }: PairingCodeProps) {
  const digits = code.split("");
  return (
    <div className={_cn}>
      {digits.map((digit, index) => (
        <CodeDigit key={index}>
          <span className={_cn2}>{digit}</span>
        </CodeDigit>
      ))}
    </div>
  );
}
