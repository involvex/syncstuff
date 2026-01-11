import React from "react";
import { Spinner, Stack, Text, YStack } from "tamagui";
export interface LoadingOverlayProps {
  message?: string;
}
export function LoadingOverlay({
  message = "Loading...",
}: LoadingOverlayProps) {
  return (
    <Stack
      alignItems="center"
      backgroundColor="rgba(0,0,0,0.5)"
      bottom={0}
      justifyContent="center"
      left={0}
      position="absolute"
      right={0}
      top={0}
      zIndex={1000}
    >
      <YStack
        alignItems="center"
        backgroundColor="$background"
        borderRadius="$4"
        elevation="$4"
        padding="$6"
        space="$4"
      >
        <Spinner color="$primary" size="large" />
        <Text fontWeight="bold">{message}</Text>
      </YStack>
    </Stack>
  );
}
