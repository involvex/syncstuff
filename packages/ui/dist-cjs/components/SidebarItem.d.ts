import type React from "react";
import "./_SidebarItem.css";
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
//# sourceMappingURL=SidebarItem.d.ts.map
