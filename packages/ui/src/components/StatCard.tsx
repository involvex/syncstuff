import "./_StatCard.css";
const _cn7 =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fos- ";
const _cn6 =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fos- ";
const _cn5 =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _fos- _col-green10 ";
const _cn4 =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _fos- _col-red10 ";
const _cn3 =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fos- _fow-bold ";
const _cn2 =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fos- _tt-uppercase _fow-bold ";
const _cn =
  "_dsp-flex _ai-stretch _fb-auto _bxs-border-box _pos-relative _mih-0px _miw-0px _fs-1 _fd-column _fg-1 ";

import React from "react";
import { Card, Stack, styled, XStack } from "tamagui";
export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
}
const IconFrame = styled(Stack, {
  padding: "$3",
  borderRadius: "$3",
  alignItems: "center",
  justifyContent: "center",
});
export function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <Card
      animation="quick"
      bordered
      elevate
      hoverStyle={{
        scale: 1,
      }}
      padding="$4"
      scale={0.98}
    >
      <XStack alignItems="center" space="$4">
        {icon && (
          <IconFrame backgroundColor="$backgroundFocus">{icon}</IconFrame>
        )}
        <div className={_cn}>
          <span className={_cn2}>{title}</span>
          <span className={_cn3}>{value}</span>
          {trend && (
            <XStack alignItems="center" space="$1">
              <span
                className={
                  !trend.positive ? _cn4 : trend.positive ? _cn5 : _cn6
                }
              >
                {trend.value}
              </span>
              <span className={_cn7}>from last week</span>
            </XStack>
          )}
        </div>
      </XStack>
    </Card>
  );
}
