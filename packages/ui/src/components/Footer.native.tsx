import React from "react";
import { XStack, YStack, Text, Separator } from "tamagui";
export function Footer() {
  return (
    <YStack
      space="$4"
      paddingVertical="$8"
      paddingHorizontal="$4"
      borderTopWidth={1}
      borderColor="$borderColor"
      backgroundColor="$background"
    >
      <XStack justifyContent="space-between" flexWrap="wrap" space="$4">
        <YStack space="$2" minWidth={200}>
          <Text fontSize="$6" fontWeight="bold">
            Syncstuff
          </Text>
          <Text color="$colorSubtitle">
            Synchronize your files and clipboard across all your devices.
          </Text>
        </YStack>

        <XStack space="$8" flexWrap="wrap">
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

      <XStack justifyContent="space-between" alignItems="center">
        <Text fontSize="$2" color="$colorSubtitle">
          © {new Date().getFullYear()} Involvex. All rights reserved.
        </Text>
        <XStack space="$4">{/* Social icons could go here */}</XStack>
      </XStack>
    </YStack>
  );
}
