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
      return <Smartphone size={size} color={color} />;
    case "tablet":
      return <Tablet size={size} color={color} />;
    case "desktop":
      return <Monitor size={size} color={color} />;
    case "laptop":
      return <Laptop size={size} color={color} />;
    case "tv":
      return <Tv size={size} color={color} />;
    case "cli":
      return <Terminal size={size} color={color} />;
    default:
      return <Smartphone size={size} color={color} />;
  }
}
