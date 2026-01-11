import { Button } from "./Button";
import { useAppTheme } from "./provider";
import { Moon, Sun } from "@tamagui/lucide-icons";

export function ThemeToggle() {
  const { theme, toggleTheme } = useAppTheme();
  return (
    <Button
      circular
      icon={theme === "light" ? <Sun /> : <Moon />}
      onPress={toggleTheme}
      backgroundColor="$background"
      hoverStyle={{
        backgroundColor: "$backgroundHover",
      }}
    />
  );
}
