import { contextBridge, ipcRenderer } from "electron";

process.once("loaded", () => {
	// expose methods from main to the renderer. They are available on "window"
	contextBridge.exposeInMainWorld("onNotificationSettingsChange", (callback) =>
		ipcRenderer.on("notificationSettingsChange", (event, args) => {
			callback(args);
		})
	);

	contextBridge.exposeInMainWorld("onExampleNotification", (callback) =>
		ipcRenderer.on("send-notification", (event, args) => {
			callback(args);
		})
	);
});
