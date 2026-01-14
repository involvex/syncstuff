import { Moon, Sun } from "lucide-react";
import { Button } from "./Button";
import { useAppTheme } from "./provider";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useAppTheme();

  return (
    <Button
      variant="ghost"
      onClick={toggleTheme}
      className="w-10 h-10 p-0 rounded-full"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-yellow-500" />
      ) : (
        <Moon className="h-5 w-5 text-slate-700" />
      )}
    </Button>
  );
};
