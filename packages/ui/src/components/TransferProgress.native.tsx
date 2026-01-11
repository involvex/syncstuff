import React from "react";
import { Progress, Text, XStack, YStack } from "tamagui";
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
      backgroundColor="$background"
      borderColor="$borderColor"
      borderRadius="$3"
      borderWidth={1}
      padding="$3"
      space="$2"
    >
      <XStack justifyContent="space-between">
        <Text fontWeight="bold" numberOfLines={1}>
          {fileName}
        </Text>
        <Text fontSize="$2">{progress}%</Text>
      </XStack>

      <Progress size="$2" value={progress}>
        <Progress.Indicator animation="quick" backgroundColor="$blue10" />
      </Progress>

      <XStack justifyContent="space-between">
        {speed && (
          <Text color="$colorSubtitle" fontSize="$1">
            {speed}
          </Text>
        )}
        {remainingTime && (
          <Text color="$colorSubtitle" fontSize="$1">
            {remainingTime}
          </Text>
        )}
      </XStack>
    </YStack>
  );
}
