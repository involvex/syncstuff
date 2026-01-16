import { type ReactNode } from "react";
import { Card, CardContent } from "./Card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  description?: string;
}

export function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <Card bordered elevate className="bg-surface border-border flex-1 min-w-[200px]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            {icon && (
              <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full p-2">
                {icon}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-color-subtitle">{title}</p>
              <h3 className="text-2xl font-bold text-on-surface">{value}</h3>
              {description && (
                <p className="text-xs text-color-subtitle">{description}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
