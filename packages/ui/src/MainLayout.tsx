import type React from "react";
import { ScrollView, View, XStack, YStack } from "./Layouts";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "./utils";

export interface MainLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  title?: string;
}

export function MainLayout({
  children,
  sidebar,
  header,
  title,
}: MainLayoutProps) {
  return (
    <View className="flex flex-row absolute inset-0 bg-background overflow-hidden">
      {/* Sidebar */}
      {sidebar && (
        <YStack
          className="hidden sm:flex border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 w-[280px]"
        >
          {sidebar}
        </YStack>
      )}

      {/* Main Content */}
      <View className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex flex-row h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <XStack className="items-center gap-4">
            {title && <span className="font-bold text-lg text-foreground">{title}</span>}
            {header}
          </XStack>
          <ThemeToggle />
        </div>

        {/* Content */}
        <ScrollView className="flex-1">
          <YStack
            className="mx-auto w-full max-w-[1200px] p-4 gap-4"
          >
            {children}
          </YStack>
        </ScrollView>
      </View>
    </View>
  );
}