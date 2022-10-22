import { contextBridge, ipcRenderer } from "electron";

process.once("loaded", () => {
  contextBridge.exposeInMainWorld("pinger", {
    ping: (args) => ipcRenderer.invoke("pinger", args),
  });
});
