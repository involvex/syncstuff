import "./_DeviceCard.css";
const _cn2 =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fos- ";
const _cn =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fos- _fow-bold ";
import React from "react";
import { Card, XStack, YStack, Text, Button } from "tamagui";
import { DeviceIcon, DeviceType } from "../DeviceIcon";
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
      elevate
      padding="$4"
      bordered
      animation="quick"
      scale={0.98}
      hoverStyle={{
        scale: 1,
      }}
    >
      <XStack space="$4" alignItems="center">
        <DeviceIcon type={type} size={32} />

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
          <Button size="$3" theme="red" onPress={onDisconnect}>
            Disconnect
          </Button>
        ) : (
          <Button size="$3" theme="blue" onPress={onConnect}>
            Connect
          </Button>
        )}
      </XStack>
    </Card>
  );
}
