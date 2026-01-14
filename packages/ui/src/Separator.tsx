import React from "react";
import { cn, extractLayoutProps, TamaguiProps } from "./utils";

export const Separator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & TamaguiProps
>(({ className, style, ...props }, ref) => {
  const { style: layoutStyle, restProps } = extractLayoutProps(props);
  return (
    <div
      ref={ref}
      className={cn("h-px w-full bg-slate-200 dark:bg-slate-800", className)}
      style={{ ...layoutStyle, ...style }}
      {...restProps}
    />
  );
});
Separator.displayName = "Separator";
