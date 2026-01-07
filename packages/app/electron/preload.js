const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electron", {
  minimize: () => ipcRenderer.invoke("window-minimize"),
  maximize: () => ipcRenderer.invoke("window-maximize"),
  close: () => ipcRenderer.invoke("window-close"),
  showWindow: () => ipcRenderer.invoke("window-show"),
  hideWindow: () => ipcRenderer.invoke("window-hide"),
  setTray: options => ipcRenderer.invoke("tray-set", options),
  onTrayClick: callback => {
    ipcRenderer.on("tray-click", () => callback());
  },
  onWindowClose: callback => {
    ipcRenderer.on("window-close-event", () => callback());
  },
});
