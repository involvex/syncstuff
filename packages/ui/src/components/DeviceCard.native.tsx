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
          <Text fontSize="$5" fontWeight="bold">
            {name}
          </Text>
          <XStack alignItems="center" space="$2">
            <StatusBadge status={status === "online" ? "success" : "neutral"}>
              {status.toUpperCase()}
            </StatusBadge>
            {lastSeen && (
              <Text fontSize="$2" color="$colorSubtitle">
                Last seen: {lastSeen}
              </Text>
            )}
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
