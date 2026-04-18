import React from "react";
import { cn, extractLayoutProps, type TamaguiProps } from "./utils";

export const Separator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & TamaguiProps
>(({ className, style, ...props }, ref) => {
  const { style: layoutStyle, restProps } = extractLayoutProps(props);
  return (
    <div
      className={cn("h-px w-full bg-slate-200 dark:bg-slate-800", className)}
      ref={ref}
      style={{ ...layoutStyle, ...style }}
      {...restProps}
    />
  );
});
Separator.displayName = "Separator";
