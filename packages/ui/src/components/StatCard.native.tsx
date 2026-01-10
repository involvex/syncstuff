import React from "react";
import { Card, XStack, YStack, Text, Stack, styled } from "tamagui";
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
      elevate
      padding="$4"
      bordered
      animation="quick"
      scale={0.98}
      hoverStyle={{
        scale: 1,
      }}
    >
      <XStack space="$4" alignItems="center">
        {icon && (
          <IconFrame backgroundColor="$backgroundFocus">{icon}</IconFrame>
        )}
        <YStack flex={1}>
          <Text
            fontSize="$2"
            color="$colorSubtitle"
            textTransform="uppercase"
            fontWeight="bold"
          >
            {title}
          </Text>
          <Text fontSize="$6" fontWeight="bold">
            {value}
          </Text>
          {trend && (
            <XStack space="$1" alignItems="center">
              <Text
                fontSize="$1"
                color={trend.positive ? "$green10" : "$red10"}
              >
                {trend.value}
              </Text>
              <Text fontSize="$1" color="$colorSubtitle">
                from last week
              </Text>
            </XStack>
          )}
        </YStack>
      </XStack>
    </Card>
  );
}
