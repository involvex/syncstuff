import React from "react";
import { YStack, Spinner, Text, Stack } from "tamagui";
export interface LoadingOverlayProps {
  message?: string;
}
export function LoadingOverlay({
  message = "Loading...",
}: LoadingOverlayProps) {
  return (
    <Stack
      position="absolute"
      top={0}
      right={0}
      bottom={0}
      left={0}
      backgroundColor="rgba(0,0,0,0.5)"
      zIndex={1000}
      alignItems="center"
      justifyContent="center"
    >
      <YStack
        backgroundColor="$background"
        padding="$6"
        borderRadius="$4"
        alignItems="center"
        space="$4"
        elevation="$4"
      >
        <Spinner size="large" color="$primary" />
        <Text fontWeight="bold">{message}</Text>
      </YStack>
    </Stack>
  );
}
