import { DarkMode, type DarkModeOptions } from "@aparajita/capacitor-dark-mode";

export type ThemeMode = "system" | "light" | "dark";

/**
 * Dark Mode Service - Manages app theme using native dark mode detection
 */
class DarkModeService {
  private currentMode: ThemeMode = "system";
  private listener: (() => void) | null = null;

  /**
   * Initialize dark mode handling
   */
  async initialize(): Promise<void> {
    const options: DarkModeOptions = {
      cssClass: "dark",
    };

    await DarkMode.init(options);

    // Set up listener for system changes
    await DarkMode.addAppearanceListener(data => {
      console.log("System dark mode changed:", data.dark);
      if (this.currentMode === "system") {
        this.applyTheme(data.dark);
      }
    });

    // Load saved preference
    const savedMode = localStorage.getItem("theme_mode") as ThemeMode | null;
    if (savedMode) {
      await this.setMode(savedMode);
    }
  }

  /**
   * Get current theme mode preference
   */
  getMode(): ThemeMode {
    return this.currentMode;
  }

  /**
   * Set theme mode
   */
  async setMode(mode: ThemeMode): Promise<void> {
    this.currentMode = mode;
    localStorage.setItem("theme_mode", mode);

    switch (mode) {
      case "dark":
        this.applyTheme(true);
        break;
      case "light":
        this.applyTheme(false);
        break;
      case "system": {
        const isDark = await DarkMode.isDarkMode();
        this.applyTheme(isDark.dark);
        break;
      }
    }
  }

  private applyTheme(isDark: boolean): void {
    document.body.classList.toggle("dark", isDark);
    document.body.classList.toggle("ion-palette-dark", isDark);

    // Update Ionic theme
    if (isDark) {
      document.documentElement.classList.add("ion-palette-dark");
    } else {
      document.documentElement.classList.remove("ion-palette-dark");
    }
  }

  /**
   * Check if currently in dark mode
   */
  async isDark(): Promise<boolean> {
    const result = await DarkMode.isDarkMode();
    return result.dark;
  }

  /**
   * Toggle between light and dark mode
   */
  async toggle(): Promise<void> {
    const isDark = await this.isDark();
    await this.setMode(isDark ? "light" : "dark");
  }

  /**
   * Update dark mode service configuration
   */
  async update(): Promise<void> {
    await DarkMode.update();
  }

  /**
   * Clean up
   */
  destroy(): void {
    if (this.listener) {
      this.listener();
      this.listener = null;
    }
  }
}

export const darkModeService = new DarkModeService();
