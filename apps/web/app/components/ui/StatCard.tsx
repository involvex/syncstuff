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
    <Card
      bordered
      elevate
      className="bg-surface border-border min-w-[200px] flex-1"
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            {icon && (
              <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full p-2">
                {icon}
              </div>
            )}
            <div>
              <p className="text-color-subtitle text-sm font-medium">{title}</p>
              <h3 className="text-on-surface text-2xl font-bold">{value}</h3>
              {description && (
                <p className="text-color-subtitle text-xs">{description}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
