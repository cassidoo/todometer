import { contextBridge, ipcRenderer } from "electron";

process.once("loaded", () => {
	// expose methods from main to the renderer. They are available on "window"
	contextBridge.exposeInMainWorld(
		"onNotificationSettingsChange",
		(callback) => {
			const listener = (_event, args) => callback(args);
			ipcRenderer.on("notificationSettingsChange", listener);
			return () =>
				ipcRenderer.removeListener("notificationSettingsChange", listener);
		},
	);

	contextBridge.exposeInMainWorld("onPlayNotificationSound", (callback) => {
		const listener = (_event, soundPath) => callback(soundPath);
		ipcRenderer.on("playNotificationSound", listener);
		return () => ipcRenderer.removeListener("playNotificationSound", listener);
	});

	contextBridge.exposeInMainWorld("showSystemNotification", (payload) => {
		ipcRenderer.send("showNotification", payload);
	});
});
