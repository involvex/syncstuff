import React from "react";
import { XStack, Text, Button } from "tamagui";
import { ThemeToggle } from "../ThemeToggle";
export interface NavigationProps {
  isLoggedIn?: boolean;
  onLogin?: () => void;
  onSignup?: () => void;
  onDashboard?: () => void;
}
export function Navigation({
  isLoggedIn,
  onLogin,
  onSignup,
  onDashboard,
}: NavigationProps) {
  return (
    <XStack
      height={64}
      alignItems="center"
      justifyContent="space-between"
      paddingHorizontal="$4"
      backgroundColor="$background"
      borderBottomWidth={1}
      borderColor="$borderColor"
      position="absolute"
      top={0}
      left={0}
      right={0}
      zIndex={100}
    >
      <XStack alignItems="center" space="$2">
        <Text fontSize="$6" fontWeight="bold" color="$primary">
          Syncstuff
        </Text>
      </XStack>

      <XStack alignItems="center" space="$4">
        <XStack
          $sm={{
            display: "none",
          }}
          space="$4"
        >
          <Text
            fontWeight="medium"
            hoverStyle={{
              color: "$primary",
            }}
            cursor="pointer"
          >
            Features
          </Text>
          <Text
            fontWeight="medium"
            hoverStyle={{
              color: "$primary",
            }}
            cursor="pointer"
          >
            Pricing
          </Text>
          <Text
            fontWeight="medium"
            hoverStyle={{
              color: "$primary",
            }}
            cursor="pointer"
          >
            Docs
          </Text>
        </XStack>

        <ThemeToggle />

        {isLoggedIn ? (
          <Button theme="blue" size="$3" onPress={onDashboard}>
            Dashboard
          </Button>
        ) : (
          <XStack space="$2">
            <Button variant="outlined" size="$3" onPress={onLogin}>
              Login
            </Button>

            <Button theme="blue" size="$3" onPress={onSignup}>
              Sign Up
            </Button>
          </XStack>
        )}
      </XStack>
    </XStack>
  );
}
