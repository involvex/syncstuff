import type React from "react";
import { Card, Stack, styled, Text, XStack, YStack } from "tamagui";
export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
}
const IconFrame = styled(Stack, {
  padding: "$3",
  borderRadius: "$3",
  alignItems: "center",
  justifyContent: "center",
});
export function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <Card
      animation="quick"
      bordered
      elevate
      hoverStyle={{
        scale: 1,
      }}
      padding="$4"
      scale={0.98}
    >
      <XStack alignItems="center" space="$4">
        {icon && (
          <IconFrame backgroundColor="$backgroundFocus">{icon}</IconFrame>
        )}
        <YStack flex={1}>
          <Text
            color="$colorSubtitle"
            fontSize="$2"
            fontWeight="bold"
            textTransform="uppercase"
          >
            {title}
          </Text>
          <Text fontSize="$6" fontWeight="bold">
            {value}
          </Text>
          {trend && (
            <XStack alignItems="center" space="$1">
              <Text
                color={trend.positive ? "$green10" : "$red10"}
                fontSize="$1"
              >
                {trend.value}
              </Text>
              <Text color="$colorSubtitle" fontSize="$1">
                from last week
              </Text>
            </XStack>
          )}
        </YStack>
      </XStack>
    </Card>
  );
}
