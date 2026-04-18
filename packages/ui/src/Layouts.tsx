import React from "react";
import { cn, extractLayoutProps, type TamaguiProps } from "./utils";

export const View = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & TamaguiProps
>(({ className, style, ...props }, ref) => {
  const { style: layoutStyle, restProps } = extractLayoutProps(props);
  return (
    <div
      className={cn("flex flex-col", className)}
      ref={ref}
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
      className={cn("flex flex-row", className)}
      ref={ref}
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
      className={cn("flex flex-col", className)}
      ref={ref}
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
      className={cn("relative flex", className)}
      ref={ref}
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
      className={cn("overflow-auto flex flex-col", className)}
      ref={ref}
      style={{ ...layoutStyle, ...style }}
      {...restProps}
    />
  );
});
ScrollView.displayName = "ScrollView";
