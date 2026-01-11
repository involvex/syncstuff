import {
  Laptop,
  Monitor,
  Smartphone,
  Tablet,
  Terminal,
  Tv,
} from "lucide-react";
import React from "react";

export type DeviceType =
  | "mobile"
  | "tablet"
  | "desktop"
  | "laptop"
  | "tv"
  | "cli"
  | "unknown";

export interface DeviceIconProps {
  type: DeviceType;
  size?: number | string;
  color?: string;
}

export function DeviceIcon({ type, size = 24, color }: DeviceIconProps) {
  const iconProps = { size: Number(size), color };

  switch (type) {
    case "mobile":
      return <Smartphone {...iconProps} />;
    case "tablet":
      return <Tablet {...iconProps} />;
    case "desktop":
      return <Monitor {...iconProps} />;
    case "laptop":
      return <Laptop {...iconProps} />;
    case "tv":
      return <Tv {...iconProps} />;
    case "cli":
      return <Terminal {...iconProps} />;
    default:
      return <Smartphone {...iconProps} />;
  }
}
