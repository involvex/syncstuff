import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "~/lib/utils";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, ...props }, ref) => {
    return (
      <div
        className={cn(
          "bg-surface-variant relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
          className,
        )}
        ref={ref}
        {...props}
      >
        {src ? (
          <img alt={alt} className="aspect-square h-full w-full" src={src} />
        ) : (
          <div className="bg-primary flex h-full w-full items-center justify-center font-bold text-white">
            {fallback || "U"}
          </div>
        )}
      </div>
    );
  },
);

Avatar.displayName = "Avatar";

export { Avatar };
