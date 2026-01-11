import type React from "react";
import { ScrollView, Text, XStack, YStack } from "tamagui";
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
      backgroundColor="$background"
      bottom={0}
      left={0}
      position="absolute"
      right={0}
      top={0}
    >
      {/* Sidebar */}
      {sidebar && (
        <YStack
          $sm={{
            display: "none",
          }}
          backgroundColor="$surface"
          borderColor="$borderColor"
          borderRightWidth={1}
          width={280}
        >
          {sidebar}
        </YStack>
      )}

      {/* Main Content */}
      <YStack flex={1}>
        {/* Header */}
        <XStack
          alignItems="center"
          backgroundColor="$surface"
          borderBottomWidth={1}
          borderColor="$borderColor"
          height={64}
          justifyContent="space-between"
          paddingHorizontal="$4"
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
            marginHorizontal="auto"
            maxWidth={1200}
            padding="$4"
            space="$4"
            width="100%"
          >
            {children}
          </YStack>
        </ScrollView>
      </YStack>
    </XStack>
  );
}
