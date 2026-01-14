import React from "react";
import { cn, extractLayoutProps, TamaguiProps } from "./utils";

export const Text = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & TamaguiProps
>(({ className, style, ...props }, ref) => {
  const { style: layoutStyle, restProps } = extractLayoutProps(props);
  return (
    <span
      ref={ref}
      className={cn("text-base text-slate-900 dark:text-slate-100", className)}
      style={{ ...layoutStyle, ...style }}
      {...restProps}
    />
  );
});
Text.displayName = "Text";

export const Paragraph = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & TamaguiProps
>(({ className, style, ...props }, ref) => {
  const { style: layoutStyle, restProps } = extractLayoutProps(props);
  return (
    <p
      ref={ref}
      className={cn(
        "text-base text-slate-900 dark:text-slate-100 mb-2",
        className,
      )}
      style={{ ...layoutStyle, ...style }}
      {...restProps}
    />
  );
});
Paragraph.displayName = "Paragraph";

export const H1 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & TamaguiProps
>(({ className, style, ...props }, ref) => {
  const { style: layoutStyle, restProps } = extractLayoutProps(props);
  return (
    <h1
      ref={ref}
      className={cn(
        "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-slate-900 dark:text-slate-100",
        className,
      )}
      style={{ ...layoutStyle, ...style }}
      {...restProps}
    />
  );
});
H1.displayName = "H1";

export const H2 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & TamaguiProps
>(({ className, style, ...props }, ref) => {
  const { style: layoutStyle, restProps } = extractLayoutProps(props);
  return (
    <h2
      ref={ref}
      className={cn(
        "scroll-m-20 border-b border-slate-200 dark:border-slate-800 pb-2 text-3xl font-semibold tracking-tight first:mt-0 text-slate-900 dark:text-slate-100",
        className,
      )}
      style={{ ...layoutStyle, ...style }}
      {...restProps}
    />
  );
});
H2.displayName = "H2";

export const H3 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & TamaguiProps
>(({ className, style, ...props }, ref) => {
  const { style: layoutStyle, restProps } = extractLayoutProps(props);
  return (
    <h3
      ref={ref}
      className={cn(
        "scroll-m-20 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100",
        className,
      )}
      style={{ ...layoutStyle, ...style }}
      {...restProps}
    />
  );
});
H3.displayName = "H3";

export const H4 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & TamaguiProps
>(({ className, style, ...props }, ref) => {
  const { style: layoutStyle, restProps } = extractLayoutProps(props);
  return (
    <h4
      ref={ref}
      className={cn(
        "scroll-m-20 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100",
        className,
      )}
      style={{ ...layoutStyle, ...style }}
      {...restProps}
    />
  );
});
H4.displayName = "H4";

export const H5 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & TamaguiProps
>(({ className, style, ...props }, ref) => {
  const { style: layoutStyle, restProps } = extractLayoutProps(props);
  return (
    <h5
      ref={ref}
      className={cn(
        "scroll-m-20 text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100",
        className,
      )}
      style={{ ...layoutStyle, ...style }}
      {...restProps}
    />
  );
});
H5.displayName = "H5";

export const H6 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & TamaguiProps
>(({ className, style, ...props }, ref) => {
  const { style: layoutStyle, restProps } = extractLayoutProps(props);
  return (
    <h6
      ref={ref}
      className={cn(
        "scroll-m-20 text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100",
        className,
      )}
      style={{ ...layoutStyle, ...style }}
      {...restProps}
    />
  );
});
H6.displayName = "H6";
