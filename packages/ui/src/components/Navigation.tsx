import { Button } from "../Button";
import { XStack } from "../Layouts";
import { ThemeToggle } from "../ThemeToggle";
import { Text } from "../Typography";

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
    <div className="flex flex-row h-16 items-center justify-between px-4 bg-background border-b border-slate-200 dark:border-slate-800 absolute top-0 left-0 right-0 z-50">
      <XStack className="items-center gap-2">
        <Text className="text-lg font-bold text-foreground">Syncstuff</Text>
      </XStack>

      <XStack className="items-center gap-4">
        <XStack className="hidden sm:flex gap-4">
          <Text className="font-medium cursor-pointer text-foreground">
            Features
          </Text>
          <Text className="font-medium cursor-pointer text-foreground">
            Pricing
          </Text>
          <Text className="font-medium cursor-pointer text-foreground">
            Docs
          </Text>
        </XStack>

        <ThemeToggle />

        {isLoggedIn ? (
          <Button
            onClick={onDashboard}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Dashboard
          </Button>
        ) : (
          <XStack className="gap-2">
            <Button onClick={onLogin} variant="outline">
              Login
            </Button>

            <Button
              onClick={onSignup}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Sign Up
            </Button>
          </XStack>
        )}
      </XStack>
    </div>
  );
}
