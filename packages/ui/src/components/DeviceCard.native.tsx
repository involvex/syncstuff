import React from "react";
import { Button, Card, Text, XStack, YStack } from "tamagui";
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
          <Text fontSize="$5" fontWeight="bold">
            {name}
          </Text>
          <XStack alignItems="center" space="$2">
            <StatusBadge status={status === "online" ? "success" : "neutral"}>
              {status.toUpperCase()}
            </StatusBadge>
            {lastSeen && (
              <Text color="$colorSubtitle" fontSize="$2">
                Last seen: {lastSeen}
              </Text>
            )}
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
