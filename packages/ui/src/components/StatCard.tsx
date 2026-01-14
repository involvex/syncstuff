import React from "react";
import { Card } from "../Card";
import { XStack, YStack } from "../Layouts";
import { Text } from "../Typography";

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string; // Kept for API compatibility
  trend?: {
    value: string;
    positive: boolean;
  };
}

export function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <Card className="p-4 transition-transform hover:scale-[1.02]">
      <XStack className="items-center gap-4">
        {icon && (
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 items-center justify-center flex">
            {icon}
          </div>
        )}
        <YStack className="flex-1">
          <Text className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400">
            {title}
          </Text>
          <Text className="text-2xl font-bold">{value}</Text>
          {trend && (
            <XStack className="items-center gap-1">
              <Text
                className={
                  trend.positive
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }
              >
                {trend.value}
              </Text>
              <Text className="text-xs text-slate-500 dark:text-slate-400">
                from last week
              </Text>
            </XStack>
          )}
        </YStack>
      </XStack>
    </Card>
  );
}
