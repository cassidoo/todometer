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

	contextBridge.exposeInMainWorld("todoAPI", {
		loadState: () => ipcRenderer.invoke("db:loadState"),
		getAllItems: () => ipcRenderer.invoke("db:getAllItems"),
		addItem: (item) => ipcRenderer.invoke("db:addItem", item),
		updateItem: (item) => ipcRenderer.invoke("db:updateItem", item),
		deleteItem: (id) => ipcRenderer.invoke("db:deleteItem", id),
		setItems: (items) => ipcRenderer.invoke("db:setItems", items),
		saveDate: (date) => ipcRenderer.invoke("db:saveDate", date),
		migrateFromLocalStorage: (state) =>
			ipcRenderer.invoke("db:migrate", state),
		onDbChanged: (callback) => {
			const listener = () => callback();
			ipcRenderer.on("db:changed", listener);
			return () => ipcRenderer.removeListener("db:changed", listener);
		},
	});

	contextBridge.exposeInMainWorld("settingsAPI", {
		getNotifications: () => ipcRenderer.invoke("settings:getNotifications"),
		setNotifications: (settings) =>
			ipcRenderer.invoke("settings:setNotifications", settings),
		showTestNotification: () =>
			ipcRenderer.invoke("settings:showTestNotification"),
		getVaultPath: () => ipcRenderer.invoke("settings:getVaultPath"),
		changeVault: () => ipcRenderer.invoke("settings:changeVault"),
		resetVault: () => ipcRenderer.invoke("settings:resetVault"),
		revealVault: () => ipcRenderer.invoke("settings:revealVault"),
		getApiState: () => ipcRenderer.invoke("settings:getApiState"),
		toggleApi: (enable) => ipcRenderer.invoke("settings:toggleApi", enable),
		copyApiToken: () => ipcRenderer.invoke("settings:copyApiToken"),
		getShowResetButton: () =>
			ipcRenderer.invoke("settings:getShowResetButton"),
		setShowResetButton: (show) =>
			ipcRenderer.invoke("settings:setShowResetButton", show),
		getShowCopyButton: () =>
			ipcRenderer.invoke("settings:getShowCopyButton"),
		setShowCopyButton: (show) =>
			ipcRenderer.invoke("settings:setShowCopyButton", show),
	});
});
