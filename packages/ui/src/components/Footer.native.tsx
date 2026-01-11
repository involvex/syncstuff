import React from "react";
import { Separator, Text, XStack, YStack } from "tamagui";
export function Footer() {
  return (
    <YStack
      backgroundColor="$background"
      borderColor="$borderColor"
      borderTopWidth={1}
      paddingHorizontal="$4"
      paddingVertical="$8"
      space="$4"
    >
      <XStack flexWrap="wrap" justifyContent="space-between" space="$4">
        <YStack minWidth={200} space="$2">
          <Text fontSize="$6" fontWeight="bold">
            Syncstuff
          </Text>
          <Text color="$colorSubtitle">
            Synchronize your files and clipboard across all your devices.
          </Text>
        </YStack>

        <XStack flexWrap="wrap" space="$8">
          <YStack space="$2">
            <Text fontWeight="bold">Product</Text>
            <Text
              color="$colorSubtitle"
              hoverStyle={{
                color: "$primary",
              }}
            >
              Features
            </Text>
            <Text
              color="$colorSubtitle"
              hoverStyle={{
                color: "$primary",
              }}
            >
              Downloads
            </Text>
            <Text
              color="$colorSubtitle"
              hoverStyle={{
                color: "$primary",
              }}
            >
              Premium
            </Text>
            <Text
              color="$colorSubtitle"
              hoverStyle={{
                color: "$primary",
              }}
            >
              Campaigns
            </Text>
          </YStack>

          <YStack space="$2">
            <Text fontWeight="bold">Company</Text>
            <Text
              color="$colorSubtitle"
              hoverStyle={{
                color: "$primary",
              }}
            >
              About
            </Text>
            <Text
              color="$colorSubtitle"
              hoverStyle={{
                color: "$primary",
              }}
            >
              Blog
            </Text>
            <Text
              color="$colorSubtitle"
              hoverStyle={{
                color: "$primary",
              }}
            >
              FAQ
            </Text>
            <Text
              color="$colorSubtitle"
              hoverStyle={{
                color: "$primary",
              }}
            >
              Contact
            </Text>
          </YStack>

          <YStack space="$2">
            <Text fontWeight="bold">Legal</Text>
            <Text
              color="$colorSubtitle"
              hoverStyle={{
                color: "$primary",
              }}
            >
              Privacy
            </Text>
            <Text
              color="$colorSubtitle"
              hoverStyle={{
                color: "$primary",
              }}
            >
              Terms
            </Text>
          </YStack>
        </XStack>
      </XStack>

      <Separator />

      <XStack alignItems="center" justifyContent="space-between">
        <Text color="$colorSubtitle" fontSize="$2">
          © {new Date().getFullYear()} Involvex. All rights reserved.
        </Text>
        <XStack space="$4">{/* Social icons could go here */}</XStack>
      </XStack>
    </YStack>
  );
}
