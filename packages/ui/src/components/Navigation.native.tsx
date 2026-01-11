import React from "react";
import { Button, Text, XStack } from "tamagui";
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
      alignItems="center"
      backgroundColor="$background"
      borderBottomWidth={1}
      borderColor="$borderColor"
      height={64}
      justifyContent="space-between"
      left={0}
      paddingHorizontal="$4"
      position="absolute"
      right={0}
      top={0}
      zIndex={100}
    >
      <XStack alignItems="center" space="$2">
        <Text color="$primary" fontSize="$6" fontWeight="bold">
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
            cursor="pointer"
            fontWeight="medium"
            hoverStyle={{
              color: "$primary",
            }}
          >
            Features
          </Text>
          <Text
            cursor="pointer"
            fontWeight="medium"
            hoverStyle={{
              color: "$primary",
            }}
          >
            Pricing
          </Text>
          <Text
            cursor="pointer"
            fontWeight="medium"
            hoverStyle={{
              color: "$primary",
            }}
          >
            Docs
          </Text>
        </XStack>

        <ThemeToggle />

        {isLoggedIn ? (
          <Button onPress={onDashboard} size="$3" theme="blue">
            Dashboard
          </Button>
        ) : (
          <XStack space="$2">
            <Button onPress={onLogin} size="$3" variant="outlined">
              Login
            </Button>

            <Button onPress={onSignup} size="$3" theme="blue">
              Sign Up
            </Button>
          </XStack>
        )}
      </XStack>
    </XStack>
  );
}
