import { type DeviceType } from "../DeviceIcon";
export interface DeviceCardProps {
  name: string;
  type: DeviceType;
  status: "online" | "offline";
  lastSeen?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
}
export declare function DeviceCard({
  name,
  type,
  status,
  lastSeen,
  onConnect,
  onDisconnect,
}: DeviceCardProps): JSX.Element;
//# sourceMappingURL=DeviceCard.native.d.ts.map
