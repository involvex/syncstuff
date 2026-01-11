import { Button } from "./Button";
import { useAppTheme } from "./provider";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useAppTheme();

  return (
    <Button
      circular
      icon={theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
      onPress={toggleTheme}
      backgroundColor="$background"
      hoverStyle={{ backgroundColor: "$backgroundHover" }}
    />
  );
}
