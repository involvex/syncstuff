import type React from "react";
export interface SidebarItemProps {
  icon?: React.ReactNode;
  label: string;
  active?: boolean;
  onPress?: () => void;
}
export declare function SidebarItem({
  icon,
  label,
  active,
  onPress,
}: SidebarItemProps): JSX.Element;
//# sourceMappingURL=SidebarItem.native.d.ts.map
