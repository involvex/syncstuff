import { Capacitor } from "@capacitor/core";

export interface ElectronWindow extends Window {
  electron?: {
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
    setTray: (options: { icon: string; tooltip: string }) => Promise<void>;
    onTrayClick: (callback: () => void) => void;
    onWindowClose: (callback: () => void) => void;
    showWindow: () => Promise<void>;
    hideWindow: () => Promise<void>;
  };
}

class ElectronService {
  private isElectron = false;
  private electronWindow: ElectronWindow | null = null;

  async initialize(): Promise<void> {
    if (Capacitor.getPlatform() === "electron") {
      this.isElectron = true;
      this.electronWindow = window as ElectronWindow;

      // Set up tray click handler
      if (this.electronWindow.electron?.onTrayClick) {
        this.electronWindow.electron.onTrayClick(() => {
          this.showWindow();
        });
      }

      // Set up window close handler to minimize to tray
      if (this.electronWindow.electron?.onWindowClose) {
        this.electronWindow.electron.onWindowClose(() => {
          this.hideWindow();
        });
      }
    }
  }

  isAvailable(): boolean {
    return this.isElectron && !!this.electronWindow?.electron;
  }

  async minimize(): Promise<void> {
    if (this.isAvailable() && this.electronWindow?.electron?.minimize) {
      await this.electronWindow.electron.minimize();
    }
  }

  async maximize(): Promise<void> {
    if (this.isAvailable() && this.electronWindow?.electron?.maximize) {
      await this.electronWindow.electron.maximize();
    }
  }

  async close(): Promise<void> {
    if (this.isAvailable() && this.electronWindow?.electron?.close) {
      await this.electronWindow.electron.close();
    }
  }

  async showWindow(): Promise<void> {
    if (this.isAvailable() && this.electronWindow?.electron?.showWindow) {
      await this.electronWindow.electron.showWindow();
    }
  }

  async hideWindow(): Promise<void> {
    if (this.isAvailable() && this.electronWindow?.electron?.hideWindow) {
      await this.electronWindow.electron.hideWindow();
    }
  }

  async setTray(options: { icon: string; tooltip: string }): Promise<void> {
    if (this.isAvailable() && this.electronWindow?.electron?.setTray) {
      await this.electronWindow.electron.setTray(options);
    }
  }
}

export const electronService = new ElectronService();
