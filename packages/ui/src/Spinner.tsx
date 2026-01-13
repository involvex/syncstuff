import React from "react";
import { cn } from "./utils";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "small" | "large";
  color?: string; // Kept for API compatibility, handled via className usually
}

export function Spinner({ size = "large", className, ...props }: SpinnerProps) {
  const sizeClass = size === "small" ? "h-4 w-4" : "h-8 w-8";
  return (
    <div className={cn("animate-spin rounded-full border-2 border-current border-t-transparent text-blue-600 dark:text-blue-500", sizeClass, className)} {...props}>
      <span className="sr-only">Loading...</span>
    </div>
  );
}