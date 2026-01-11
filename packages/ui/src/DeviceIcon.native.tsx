import {
  Laptop,
  Monitor,
  Smartphone,
  Tablet,
  Terminal,
  Tv,
} from "@tamagui/lucide-icons";
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
  switch (type) {
    case "mobile":
      return <Smartphone color={color} size={size} />;
    case "tablet":
      return <Tablet color={color} size={size} />;
    case "desktop":
      return <Monitor color={color} size={size} />;
    case "laptop":
      return <Laptop color={color} size={size} />;
    case "tv":
      return <Tv color={color} size={size} />;
    case "cli":
      return <Terminal color={color} size={size} />;
    default:
      return <Smartphone color={color} size={size} />;
  }
}
