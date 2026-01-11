import { Moon, Sun } from "lucide-react";
import { Button } from "./Button";
import { useAppTheme } from "./provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useAppTheme();

  return (
    <Button
      backgroundColor="$background"
      circular
      hoverStyle={{ backgroundColor: "$backgroundHover" }}
      icon={theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
      onPress={toggleTheme}
    />
  );
}
