import { Moon, Sun } from "lucide-react";
import { Button } from "./Button";
import { useAppTheme } from "./provider";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useAppTheme();

  return (
    <Button
      aria-label="Toggle theme"
      className="w-10 h-10 p-0 rounded-full"
      onClick={toggleTheme}
      variant="ghost"
    >
      {theme === "dark"
        ? (Sun({ className: "h-5 w-5 text-yellow-500" }) as React.ReactElement)
        : (Moon({ className: "h-5 w-5 text-slate-700" }) as React.ReactElement)}
    </Button>
  );
};
