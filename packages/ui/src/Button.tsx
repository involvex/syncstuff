import { clsx, type ClassValue } from "clsx";
import React from "react";
import { twMerge } from "tailwind-merge";
import { extractLayoutProps, TamaguiProps } from "./utils";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, TamaguiProps {
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary" | string;
  size?: "default" | "sm" | "lg" | "icon" | string;
  onPress?: (e?: any) => void;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", style, onPress, onClick, icon, children, ...props }, ref) => {
    const { style: layoutStyle, restProps } = extractLayoutProps(props);
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ring-offset-background";
    
    const variants: Record<string, string> = {
      default: "bg-primary text-on-primary hover:opacity-90",
      destructive: "bg-red-600 text-white hover:bg-red-700 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-900/90",
      outline: "border border-outline-variant bg-background hover:bg-surface-variant hover:text-on-surface-variant",
      secondary: "bg-secondary text-on-secondary hover:bg-secondary/80",
      ghost: "hover:bg-surface-variant hover:text-on-surface-variant",
      outlined: "border border-outline-variant bg-background hover:bg-surface-variant hover:text-on-surface-variant", // Mapped alias
    };

    const sizes: Record<string, string> = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
      "$2": "h-9 px-3", // Mapped alias
      "$4": "h-10 px-4 py-2", // Mapped alias
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      onClick?.(e);
      onPress?.(e);
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant as string] || variants.default, sizes[size as string] || sizes.default, className)}
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
