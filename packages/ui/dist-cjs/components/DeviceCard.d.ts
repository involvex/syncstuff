import { type DeviceType } from "../DeviceIcon";
import "./_DeviceCard.css";
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
//# sourceMappingURL=DeviceCard.d.ts.map
