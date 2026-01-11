import type React from "react";
export type StatusType = "success" | "warning" | "error" | "info" | "neutral";
export interface StatusBadgeProps {
  status: StatusType;
  children: React.ReactNode;
}
export declare function StatusBadge({
  status,
  children,
}: StatusBadgeProps): JSX.Element;
//# sourceMappingURL=StatusBadge.d.ts.map
