import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, func) =>
      ipcRenderer.on(channel, (event, ...args) => func(...args)),
    once: (channel, func) =>
      ipcRenderer.once(channel, (event, ...args) => func(...args)),
    removeListener: (channel, func) =>
      ipcRenderer.removeListener(channel, func),
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  },
});
