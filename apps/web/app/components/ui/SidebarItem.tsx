import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "~/lib/utils";

interface SidebarItemProps extends HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const SidebarItem = forwardRef<HTMLDivElement, SidebarItemProps>((
  { className, icon, label, active = false, ...props }, ref
) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
        "transition-colors hover:bg-surface-hover",
        active 
          ? "bg-primary text-primary-foreground"
          : "text-on-surface hover:text-primary",
        className
      )}
      {...props}
    >
      <span className="size-5">{icon}</span>
      <span>{label}</span>
    </div>
  );
});

SidebarItem.displayName = "SidebarItem";

export { SidebarItem };