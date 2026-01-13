import React from "react";
import { cn, extractLayoutProps, TamaguiProps } from "./utils";

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & TamaguiProps>(({ className, style, ...props }, ref) => {
  const { style: layoutStyle, restProps } = extractLayoutProps(props);
  return (
    <div ref={ref} className={cn("rounded-lg border bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-50 shadow-sm p-4", className)} style={{ ...layoutStyle, ...style }} {...restProps} />
  );
});
Card.displayName = "Card";