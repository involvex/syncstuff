import { type ReactNode } from "react";
import { cn } from "~/lib/utils";

interface MainLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
  title?: string;
  className?: string;
}

export function MainLayout({
  sidebar,
  children,
  title = "Dashboard",
  className,
}: MainLayoutProps) {
  return (
    <div className="bg-background text-on-background min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <div className="border-border hidden border-r lg:block">{sidebar}</div>

        {/* Mobile sidebar toggle - would need state management */}
        <div className="border-border border-b p-4 lg:hidden">
          <button className="flex items-center gap-2">
            <span className="size-6">☰</span>
            <span className="font-semibold">{title}</span>
          </button>
        </div>

        {/* Main content */}
        <main className={cn("p-4 md:p-6", className)}>
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
