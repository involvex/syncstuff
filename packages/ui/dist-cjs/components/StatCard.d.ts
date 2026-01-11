import "./_StatCard.css";
import type React from "react";
export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
}
export declare function StatCard({
  title,
  value,
  icon,
  trend,
}: StatCardProps): JSX.Element;
//# sourceMappingURL=StatCard.d.ts.map
