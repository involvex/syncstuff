import React from "react";
import { XStack, YStack, Text, Progress } from "tamagui";
export interface TransferProgressProps {
  fileName: string;
  progress: number; // 0 to 100
  speed?: string;
  remainingTime?: string;
}
export function TransferProgress({
  fileName,
  progress,
  speed,
  remainingTime,
}: TransferProgressProps) {
  return (
    <YStack
      space="$2"
      padding="$3"
      backgroundColor="$background"
      borderRadius="$3"
      borderWidth={1}
      borderColor="$borderColor"
    >
      <XStack justifyContent="space-between">
        <Text fontWeight="bold" numberOfLines={1}>
          {fileName}
        </Text>
        <Text fontSize="$2">{progress}%</Text>
      </XStack>

      <Progress value={progress} size="$2">
        <Progress.Indicator animation="quick" backgroundColor="$blue10" />
      </Progress>

      <XStack justifyContent="space-between">
        {speed && (
          <Text fontSize="$1" color="$colorSubtitle">
            {speed}
          </Text>
        )}
        {remainingTime && (
          <Text fontSize="$1" color="$colorSubtitle">
            {remainingTime}
          </Text>
        )}
      </XStack>
    </YStack>
  );
}
