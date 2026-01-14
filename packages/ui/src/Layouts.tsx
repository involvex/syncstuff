import React from "react";
import { cn, extractLayoutProps, TamaguiProps } from "./utils";

export const View = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & TamaguiProps
>(({ className, style, ...props }, ref) => {
  const { style: layoutStyle, restProps } = extractLayoutProps(props);
  return (
    <div
      ref={ref}
      className={cn("flex flex-col", className)}
      style={{ ...layoutStyle, ...style }}
      {...restProps}
    />
  );
});
View.displayName = "View";

export const Stack = View;

export const XStack = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & TamaguiProps
>(({ className, style, ...props }, ref) => {
  const { style: layoutStyle, restProps } = extractLayoutProps(props);
  return (
    <div
      ref={ref}
      className={cn("flex flex-row", className)}
      style={{ ...layoutStyle, ...style }}
      {...restProps}
    />
  );
});
XStack.displayName = "XStack";

export const YStack = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & TamaguiProps
>(({ className, style, ...props }, ref) => {
  const { style: layoutStyle, restProps } = extractLayoutProps(props);
  return (
    <div
      ref={ref}
      className={cn("flex flex-col", className)}
      style={{ ...layoutStyle, ...style }}
      {...restProps}
    />
  );
});
YStack.displayName = "YStack";

export const ZStack = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & TamaguiProps
>(({ className, style, ...props }, ref) => {
  const { style: layoutStyle, restProps } = extractLayoutProps(props);
  return (
    <div
      ref={ref}
      className={cn("relative flex", className)}
      style={{ ...layoutStyle, ...style }}
      {...restProps}
    />
  );
});
ZStack.displayName = "ZStack";

export const ScrollView = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & TamaguiProps
>(({ className, style, ...props }, ref) => {
  const { style: layoutStyle, restProps } = extractLayoutProps(props);
  return (
    <div
      ref={ref}
      className={cn("overflow-auto flex flex-col", className)}
      style={{ ...layoutStyle, ...style }}
      {...restProps}
    />
  );
});
ScrollView.displayName = "ScrollView";
