import { Moon, Sun } from "@tamagui/lucide-icons";
import { Button } from "./Button";
import { useAppTheme } from "./provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useAppTheme();
  return (
    <Button
      backgroundColor="$background"
      circular
      hoverStyle={{
        backgroundColor: "$backgroundHover",
      }}
      icon={theme === "light" ? <Sun /> : <Moon />}
      onPress={toggleTheme}
    />
  );
}
