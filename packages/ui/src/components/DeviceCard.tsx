import { Button } from "../Button";
import { Card } from "../Card";
import { DeviceIcon, type DeviceType } from "../DeviceIcon";
import { XStack, YStack } from "../Layouts";
import { Text } from "../Typography";
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
    <Card className="p-4 transition-transform hover:scale-[1.02]">
      <XStack className="items-center gap-4">
        <DeviceIcon size={32} type={type} />

        <YStack className="flex-1 gap-1">
          <Text className="font-bold text-base">{name}</Text>
          <XStack className="items-center gap-2">
            <StatusBadge status={status === "online" ? "success" : "neutral"}>
              {status.toUpperCase()}
            </StatusBadge>
            {lastSeen && (
              <Text className="text-xs text-slate-500 dark:text-slate-400">
                Last seen: {lastSeen}
              </Text>
            )}
          </XStack>
        </YStack>

        {status === "online" ? (
          <Button
            onClick={onDisconnect}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Disconnect
          </Button>
        ) : (
          <Button
            onClick={onConnect}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Connect
          </Button>
        )}
      </XStack>
    </Card>
  );
}
