const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  nativeImage,
  ipcMain,
  Notification,
} = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const fs = require("fs");

let mainWindow = null;
let tray = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.resolve(__dirname, "preload.js"),
    },
    icon: path.resolve(
      __dirname,
      process.platform === "win32"
        ? "../public/icon.ico"
        : "../public/favicon.png",
    ),
    show: false, // Don't show until ready
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  // Show window when ready
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Handle window close - minimize to tray instead
  mainWindow.on("close", event => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      mainWindow.webContents.send("window-close-event");
      return false;
    }
  });

  // Window control IPC handlers
  ipcMain.handle("window-minimize", () => {
    if (mainWindow) {
      mainWindow.minimize();
    }
  });

  ipcMain.handle("window-maximize", () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.handle("window-close", () => {
    if (mainWindow) {
      app.isQuitting = true;
      mainWindow.close();
    }
  });

  ipcMain.handle("window-show", () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  ipcMain.handle("window-hide", () => {
    if (mainWindow) {
      mainWindow.hide();
    }
  });

  // Tray IPC handlers
  ipcMain.handle("tray-set", (event, options) => {
    if (tray) {
      if (options.tooltip) {
        tray.setToolTip(options.tooltip);
      }
    }
  });

  // Notification IPC handlers
  ipcMain.handle("show-notification", (event, options) => {
    if (Notification.isSupported()) {
      const notification = new Notification({
        title: options.title,
        body: options.body,
        icon: options.icon || path.join(__dirname, "../public/favicon.png"),
      });
      notification.show();

      if (options.onClick) {
        notification.on("click", () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        });
      }
    }
    return { success: true };
  });

  // File system IPC handlers
  ipcMain.handle("fs-read-file", async (event, filePath) => {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      return { success: true, data: content };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("fs-write-file", async (event, filePath, content) => {
    try {
      fs.writeFileSync(filePath, content, "utf-8");
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("fs-exists", async (event, filePath) => {
    try {
      return { success: true, exists: fs.existsSync(filePath) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Device sync IPC handlers
  ipcMain.handle("sync-device-connected", (event, deviceInfo) => {
    // Update tray tooltip to show connected device
    if (tray) {
      tray.setToolTip(`Syncstuff - Connected to ${deviceInfo.name}`);
    }

    // Show notification
    if (Notification.isSupported()) {
      new Notification({
        title: "Device Connected",
        body: `${deviceInfo.name} is now connected`,
      }).show();
    }

    return { success: true };
  });

  ipcMain.handle("sync-device-disconnected", (event, deviceInfo) => {
    if (tray) {
      tray.setToolTip("Syncstuff");
    }

    if (Notification.isSupported()) {
      new Notification({
        title: "Device Disconnected",
        body: `${deviceInfo.name} disconnected`,
      }).show();
    }

    return { success: true };
  });

  ipcMain.handle("sync-transfer-started", (event, transferInfo) => {
    if (Notification.isSupported()) {
      new Notification({
        title: "Transfer Started",
        body: `Sending ${transferInfo.fileName}`,
      }).show();
    }
    return { success: true };
  });

  ipcMain.handle("sync-transfer-complete", (event, transferInfo) => {
    if (Notification.isSupported()) {
      const notification = new Notification({
        title: "Transfer Complete",
        body: `${transferInfo.fileName} sent successfully`,
      });
      notification.show();

      notification.on("click", () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      });
    }
    return { success: true };
  });

  ipcMain.handle("sync-transfer-failed", (event, transferInfo) => {
    if (Notification.isSupported()) {
      new Notification({
        title: "Transfer Failed",
        body: `Failed to send ${transferInfo.fileName}`,
      }).show();
    }
    return { success: true };
  });

  // Auto-updater placeholder
  ipcMain.handle("check-for-updates", async () => {
    // This will be implemented with electron-updater
    return { success: true, updateAvailable: false };
  });

  // Create tray
  createTray();
}

function createTray() {
  // Try icon.ico first (Windows), fallback to favicon.png
  const iconPath =
    process.platform === "win32"
      ? path.join(__dirname, "../public/icon.ico")
      : path.join(__dirname, "../public/favicon.png");
  const icon = nativeImage.createFromPath(iconPath);

  tray = new Tray(icon.resize({ width: 16, height: 16 }));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show Syncstuff",
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: "separator" },
    {
      label: "Connected Devices",
      enabled: false,
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip("Syncstuff");
  tray.setContextMenu(contextMenu);

  // Tray click handler
  tray.on("click", () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
      // Notify renderer
      if (mainWindow.webContents) {
        mainWindow.webContents.send("tray-click");
      }
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
});

app.on("window-all-closed", () => {
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  app.isQuitting = true;
});
