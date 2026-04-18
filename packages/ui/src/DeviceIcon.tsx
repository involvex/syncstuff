import {
  Laptop,
  Monitor,
  Smartphone,
  Tablet,
  Terminal,
  Tv,
} from "lucide-react";

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

const icons = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
  laptop: Laptop,
  tv: Tv,
  cli: Terminal,
  unknown: Smartphone,
} as const;

export function DeviceIcon({ type, size = 24, color }: DeviceIconProps) {
  const Icon = icons[type] ?? icons.unknown;
  const props = { size: Number(size), color };
  return Icon(props) as React.ReactElement;
}
