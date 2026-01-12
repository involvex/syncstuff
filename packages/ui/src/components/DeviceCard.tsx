import "./_DeviceCard.css";
const _cn2 =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fos- ";
const _cn =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fos- _fow-bold ";

import React from "react";
import { Card, XStack, YStack } from "tamagui";
import { DeviceIcon, type DeviceType } from "../DeviceIcon";
import { StatusBadge } from "./StatusBadge";
export interface DeviceCardProps {
  name: string;
  type: DeviceType;
  status: "online" | "offline";
  lastSeen?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
}
export function DeviceCard({
  name,
  type,
  status,
  lastSeen,
  onConnect,
  onDisconnect,
}: DeviceCardProps) {
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
        <DeviceIcon size={32} type={type} />

        <YStack flex={1} space="$1">
          <span className={_cn}>{name}</span>
          <XStack alignItems="center" space="$2">
            <StatusBadge status={status === "online" ? "success" : "neutral"}>
              {status.toUpperCase()}
            </StatusBadge>
            {lastSeen && <span className={_cn2}>Last seen: {lastSeen}</span>}
          </XStack>
        </YStack>

        {status === "online" ? (
          <Button onPress={onDisconnect} size="$3" theme="red">
            Disconnect
          </Button>
        ) : (
          <Button onPress={onConnect} size="$3" theme="blue">
            Connect
          </Button>
        )}
      </XStack>
    </Card>
  );
}
