import React, { useRef } from "react";
import type { Device } from "../../types/device.types";
import {
  Card,
  YStack,
  XStack,
  Text,
  Button,
  DeviceIcon,
  StatusBadge,
  View,
  Separator,
} from "@syncstuff/ui";
import "./DeviceCard.css";

interface DeviceCardProps {
  device: Device;
  isPaired: boolean;
  onPair?: (device: Device) => void;
  onUnpair?: (deviceId: string) => void;
  onConnect?: (deviceId: string) => void;
  onSendFile?: (file: File, deviceId: string) => void;
  onPing?: (deviceId: string) => void;
  onRing?: (deviceId: string) => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  isPaired,
  onPair,
  onUnpair,
  onConnect,
  onSendFile,
  onPing,
  onRing,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getDeviceType = ():
    | "mobile"
    | "tablet"
    | "desktop"
    | "laptop"
    | "tv"
    | "cli"
    | "unknown" => {
    switch (device.platform) {
      case "android":
      case "ios":
        return "mobile";
      case "desktop":
        return "desktop";
      case "web":
        return "laptop";
      default:
        return "mobile";
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onSendFile) {
      onSendFile(file, device.id);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
      <Card
        elevate
        bordered
        padding="$4"
        marginBottom="$3"
        animation="quick"
        scale={0.98}
        hoverStyle={{ scale: 1 }}
      >
        <YStack space="$4">
          <XStack space="$4" alignItems="center">
            <View
              backgroundColor="$backgroundFocus"
              padding="$4"
              borderRadius="$3"
            >
              <DeviceIcon type={getDeviceType()} size={32} />
            </View>
            <YStack flex={1}>
              <Text fontSize="$5" fontWeight="bold">
                {device.name}
              </Text>
              <Text fontSize="$1" color="$colorSubtitle" fontFamily="$mono">
                {device.id}
              </Text>
            </YStack>
            {device.battery && (
              <XStack alignItems="center" space="$1">
                <Text fontSize="$1" color="$colorSubtitle">
                  {Math.round(device.battery.level * 100)}%
                </Text>
                <View
                  width={10}
                  height={16}
                  borderWidth={1}
                  borderColor="$colorSubtitle"
                  borderRadius={2}
                  padding={1}
                >
                  <View
                    height={`${device.battery.level * 100}%`}
                    backgroundColor={
                      device.battery.level > 0.2 ? "$green10" : "$red10"
                    }
                    width="100%"
                    marginTop="auto"
                  />
                </View>
              </XStack>
            )}
          </XStack>

          <XStack space="$2">
            <StatusBadge status={isPaired ? "success" : "neutral"}>
              {isPaired ? "PAIRED" : "DISCOVERED"}
            </StatusBadge>
            <StatusBadge
              status={device.status === "connected" ? "info" : "neutral"}
            >
              {device.status.toUpperCase()}
            </StatusBadge>
          </XStack>

          <Separator />

          <XStack space="$2" flexWrap="wrap">
            {!isPaired && onPair && (
              <Button
                theme="blue"
                size="$3"
                flex={1}
                onPress={() => onPair(device)}
              >
                Pair
              </Button>
            )}
            {isPaired && onConnect && (
              <Button
                theme="blue"
                size="$3"
                flex={1}
                onPress={() => onConnect(device.id)}
              >
                Connect
              </Button>
            )}
            {isPaired && onSendFile && (
              <Button
                variant="outlined"
                size="$3"
                onPress={triggerFileSelect}
                icon={<Text>📎</Text>}
              >
                File
              </Button>
            )}
            {isPaired && onPing && (
              <Button
                variant="outlined"
                size="$3"
                onPress={() => onPing(device.id)}
              >
                Ping
              </Button>
            )}
            {isPaired && onRing && (
              <Button
                variant="outlined"
                size="$3"
                onPress={() => onRing(device.id)}
              >
                🔔
              </Button>
            )}
            {isPaired && onUnpair && (
              <Button
                theme="red"
                size="$3"
                variant="outlined"
                onPress={() => onUnpair(device.id)}
              >
                ✕
              </Button>
            )}
          </XStack>
        </YStack>
      </Card>
    </>
  );
};
