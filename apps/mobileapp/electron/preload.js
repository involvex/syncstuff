const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electron", {
  // Window controls
  windowMinimize: () => ipcRenderer.invoke("window-minimize"),
  windowMaximize: () => ipcRenderer.invoke("window-maximize"),
  windowClose: () => ipcRenderer.invoke("window-close"),
  windowShow: () => ipcRenderer.invoke("window-show"),
  windowHide: () => ipcRenderer.invoke("window-hide"),

  // Tray
  traySet: options => ipcRenderer.invoke("tray-set", options),

  // Notifications
  showNotification: options => ipcRenderer.invoke("show-notification", options),

  // File system
  fs: {
    readFile: filePath => ipcRenderer.invoke("fs-read-file", filePath),
    writeFile: (filePath, content) =>
      ipcRenderer.invoke("fs-write-file", filePath, content),
    exists: filePath => ipcRenderer.invoke("fs-exists", filePath),
  },

  // Device sync
  sync: {
    deviceConnected: deviceInfo =>
      ipcRenderer.invoke("sync-device-connected", deviceInfo),
    deviceDisconnected: deviceInfo =>
      ipcRenderer.invoke("sync-device-disconnected", deviceInfo),
    transferStarted: transferInfo =>
      ipcRenderer.invoke("sync-transfer-started", transferInfo),
    transferComplete: transferInfo =>
      ipcRenderer.invoke("sync-transfer-complete", transferInfo),
    transferFailed: transferInfo =>
      ipcRenderer.invoke("sync-transfer-failed", transferInfo),
  },

  // Updates
  checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),

  // Event listeners
  on: (channel, callback) => {
    const validChannels = ["window-close-event", "tray-click"];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  },

  // Remove event listeners
  removeListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
  },

  // Platform info
  platform: process.platform,
  isElectron: true,
});
