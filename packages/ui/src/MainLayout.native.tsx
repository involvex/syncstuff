import React from "react";
import { YStack, XStack, Text, ScrollView } from "tamagui";
import { ThemeToggle } from "./ThemeToggle";
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
    <XStack
      position="absolute"
      top={0}
      right={0}
      bottom={0}
      left={0}
      backgroundColor="$background"
    >
      {/* Sidebar */}
      {sidebar && (
        <YStack
          width={280}
          borderRightWidth={1}
          borderColor="$borderColor"
          backgroundColor="$surface"
          $sm={{
            display: "none",
          }}
        >
          {sidebar}
        </YStack>
      )}

      {/* Main Content */}
      <YStack flex={1}>
        {/* Header */}
        <XStack
          height={64}
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal="$4"
          borderBottomWidth={1}
          borderColor="$borderColor"
          backgroundColor="$surface"
        >
          <XStack alignItems="center" space="$4">
            {title && (
              <Text fontSize="$6" fontWeight="bold">
                {title}
              </Text>
            )}
            {header}
          </XStack>
          <ThemeToggle />
        </XStack>

        {/* Content */}
        <ScrollView flex={1}>
          <YStack
            padding="$4"
            space="$4"
            maxWidth={1200}
            marginHorizontal="auto"
            width="100%"
          >
            {children}
          </YStack>
        </ScrollView>
      </YStack>
    </XStack>
  );
}
