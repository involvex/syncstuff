import React from "react";
import { Text } from "../Typography";
import { cn } from "../utils";

export interface SidebarItemProps {
  icon?: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function SidebarItem({
  icon,
  label,
  active,
  onClick,
}: SidebarItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex flex-row items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors",
        "hover:bg-slate-100 dark:hover:bg-slate-800",
        active && "bg-blue-50 dark:bg-blue-900/20",
      )}
    >
      {icon && (
        <div className="shrink-0 text-slate-500 dark:text-slate-400">
          {icon}
        </div>
      )}
      <Text
        className={cn(
          active
            ? "font-bold text-blue-600 dark:text-blue-400"
            : "font-normal text-slate-700 dark:text-slate-300",
        )}
      >
        {label}
      </Text>
    </div>
  );
}
