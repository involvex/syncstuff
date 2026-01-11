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
export declare function DeviceIcon({
  type,
  size,
  color,
}: DeviceIconProps): JSX.Element;
//# sourceMappingURL=DeviceIcon.native.d.ts.map
