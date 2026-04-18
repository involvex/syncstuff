import React from "react";
import { cn, extractLayoutProps, type TamaguiProps } from "./utils";

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & TamaguiProps
>(({ className, style, ...props }, ref) => {
  const { style: layoutStyle, restProps } = extractLayoutProps(props);
  return (
    <div
      className={cn(
        "rounded-lg border bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-50 shadow-sm p-4",
        className,
      )}
      ref={ref}
      style={{ ...layoutStyle, ...style }}
      {...restProps}
    />
  );
});
Card.displayName = "Card";
