import { clsx, type ClassValue } from "clsx";
import React from "react";
import { twMerge } from "tailwind-merge";
import { extractLayoutProps, TamaguiProps } from "./utils";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, TamaguiProps {
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  onPress?: (e?: any) => void;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", style, onPress, onClick, icon, children, ...props }, ref) => {
    const { style: layoutStyle, restProps } = extractLayoutProps(props);

    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50";

    const variantStyles = {
      default: "bg-primary text-onPrimary hover:opacity-90 shadow-sm",
      destructive: "bg-error text-onError hover:opacity-90 shadow-sm",
      outline:
        "border border-primary bg-transparent text-primary hover:bg-primary hover:text-onPrimary",
      secondary: "bg-secondary text-onSecondary hover:opacity-90 shadow-sm",
      ghost: "hover:bg-surface hover:text-onSurface",
    };

    const sizeStyles = {
      default: "h-10 px-4 py-2 rounded-md",
      sm: "h-9 px-3 rounded-sm",
      lg: "h-11 px-8 rounded-lg",
      icon: "h-10 w-10 rounded-full",
    };

    const handleClick = (
      e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
      onClick?.(e);
      onPress?.(e);
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        style={{ ...layoutStyle, ...style }}
        onClick={handleClick}
        {...restProps}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
