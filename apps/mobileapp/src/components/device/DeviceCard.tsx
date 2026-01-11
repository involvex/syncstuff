import {
  Button,
  Card,
  DeviceIcon,
  Separator,
  StatusBadge,
  Text,
  View,
  XStack,
  YStack,
} from "@syncstuff/ui";
import type React from "react";
import { useRef } from "react";
import type { Device } from "../../types/device.types";
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
        onChange={handleFileSelect}
        ref={fileInputRef}
        style={{ display: "none" }}
        type="file"
      />
      <Card
        animation="quick"
        bordered
        elevate
        hoverStyle={{ scale: 1 }}
        marginBottom="$3"
        padding="$4"
        scale={0.98}
      >
        <YStack space="$4">
          <XStack alignItems="center" space="$4">
            <View
              backgroundColor="$backgroundFocus"
              borderRadius="$3"
              padding="$4"
            >
              <DeviceIcon size={32} type={getDeviceType()} />
            </View>
            <YStack flex={1}>
              <Text fontSize="$5" fontWeight="bold">
                {device.name}
              </Text>
              <Text color="$colorSubtitle" fontFamily="$mono" fontSize="$1">
                {device.id}
              </Text>
            </YStack>
            {device.battery && (
              <XStack alignItems="center" space="$1">
                <Text color="$colorSubtitle" fontSize="$1">
                  {Math.round(device.battery.level * 100)}%
                </Text>
                <View
                  borderColor="$colorSubtitle"
                  borderRadius={2}
                  borderWidth={1}
                  height={16}
                  padding={1}
                  width={10}
                >
                  <View
                    backgroundColor={
                      device.battery.level > 0.2 ? "$green10" : "$red10"
                    }
                    height={`${device.battery.level * 100}%`}
                    marginTop="auto"
                    width="100%"
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

          <XStack flexWrap="wrap" space="$2">
            {!isPaired && onPair && (
              <Button
                flex={1}
                onPress={() => onPair(device)}
                size="$3"
                theme="blue"
              >
                Pair
              </Button>
            )}
            {isPaired && onConnect && (
              <Button
                flex={1}
                onPress={() => onConnect(device.id)}
                size="$3"
                theme="blue"
              >
                Connect
              </Button>
            )}
            {isPaired && onSendFile && (
              <Button
                icon={<Text>📎</Text>}
                onPress={triggerFileSelect}
                size="$3"
                variant="outlined"
              >
                File
              </Button>
            )}
            {isPaired && onPing && (
              <Button
                onPress={() => onPing(device.id)}
                size="$3"
                variant="outlined"
              >
                Ping
              </Button>
            )}
            {isPaired && onRing && (
              <Button
                onPress={() => onRing(device.id)}
                size="$3"
                variant="outlined"
              >
                🔔
              </Button>
            )}
            {isPaired && onUnpair && (
              <Button
                onPress={() => onUnpair(device.id)}
                size="$3"
                theme="red"
                variant="outlined"
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
