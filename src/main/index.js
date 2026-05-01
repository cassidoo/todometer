import {
	app,
	BrowserWindow,
	Menu,
	dialog,
	powerMonitor,
	shell,
	Notification,
	ipcMain,
} from "electron";
import * as StoreModule from "electron-store";
import * as isDevModule from "electron-is-dev";
import { autoUpdater } from "electron-updater";
import path from "path";
import fs from "fs";
import { version } from "../../package.json";
import * as db from "./db.js";
import * as apiServer from "./api-server.js";

const unwrapDefault = (mod) => mod?.default?.default ?? mod?.default ?? mod;
const Store = unwrapDefault(StoreModule);
const isDev = unwrapDefault(isDevModule);
const store = new Store();

if (process.platform === "win32") {
	app.setAppUserModelId(process.execPath);
}

// Register todometer:// protocol
app.setAsDefaultProtocolClient("todometer");

// Queue protocol URLs received before the app is ready
let pendingProtocolUrls = [];
let isAppReady = false;

function handleProtocolUrl(url) {
	if (!isAppReady) {
		pendingProtocolUrls.push(url);
		return;
	}

	try {
		const parsed = new URL(url);
		const command = parsed.hostname;

		if (command === "add") {
			const text = parsed.searchParams.get("text");
			const status = parsed.searchParams.get("status") || "pending";
			if (text) {
				db.addItem({ text, status });
				// Notify renderer to reload
				if (hasMainWindow()) {
					mainWindow.webContents.send("db:changed");
				}
			}
		}

		showAndFocusMainWindow();
	} catch (err) {
		console.error("Failed to handle protocol URL:", err);
	}
}

function processPendingUrls() {
	isAppReady = true;
	for (const url of pendingProtocolUrls) {
		handleProtocolUrl(url);
	}
	pendingProtocolUrls = [];
}

// macOS: open-url fires when the app is opened via a URL
app.on("open-url", (event, url) => {
	event.preventDefault();
	handleProtocolUrl(url);
});

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
	app.quit();
}

const defaultNotificationSettings = {
	resetNotification: true,
	reminderNotification: "never",
};

let notificationSettings = {
	resetNotification:
		store.get("reset") ?? defaultNotificationSettings.resetNotification,
	reminderNotification:
		store.get("reminder") ?? defaultNotificationSettings.reminderNotification,
};

let mainWindow = null;
let willQuit = false;
let isCheckingForUpdatesManually = false;
const notificationSoundPath = path.join(app.getAppPath(), "assets/bloop.mp3");

function hasMainWindow() {
	return (
		mainWindow &&
		typeof mainWindow.isDestroyed === "function" &&
		!mainWindow.isDestroyed()
	);
}

function showAndFocusMainWindow() {
	if (!hasMainWindow()) {
		return false;
	}

	if (mainWindow.isMinimized()) {
		mainWindow.restore();
	}

	if (!mainWindow.isVisible()) {
		mainWindow.show();
	}

	mainWindow.focus();
	return true;
}

function playNotificationSound() {
	if (!hasMainWindow()) {
		return;
	}

	mainWindow.webContents.send("playNotificationSound", notificationSoundPath);
}

function getDefaultDbPath() {
	return path.join(app.getPath("userData"), "todometer.db");
}

function getCurrentDbPath() {
	const customPath = store.get("vaultPath");
	if (customPath) {
		return path.join(customPath, "todometer.db");
	}
	return getDefaultDbPath();
}

function initDatabase() {
	const dbPath = getCurrentDbPath();
	const dir = path.dirname(dbPath);

	// Check if custom vault path is accessible
	if (store.get("vaultPath") && !fs.existsSync(dir)) {
		const choice = dialog.showMessageBoxSync(null, {
			type: "warning",
			title: "Data vault Not Found",
			message: `The data folder is not accessible:\n${dir}`,
			detail:
				"The folder may have been moved, deleted, or the drive may be disconnected.",
			buttons: ["Use Default Location", "Choose New Location", "Quit"],
			defaultId: 0,
			cancelId: 2,
		});

		if (choice === 0) {
			store.delete("vaultPath");
			return db.openDatabase(getDefaultDbPath());
		} else if (choice === 1) {
			const result = dialog.showOpenDialogSync(null, {
				title: "Choose data vault location",
				properties: ["openDirectory", "createDirectory"],
			});
			if (result && result[0]) {
				store.set("vaultPath", result[0]);
				return db.openDatabase(path.join(result[0], "todometer.db"));
			}
			store.delete("vaultPath");
			return db.openDatabase(getDefaultDbPath());
		} else {
			app.quit();
			return null;
		}
	}

	return db.openDatabase(dbPath);
}

async function changeVaultLocation() {
	if (!hasMainWindow()) return;

	const result = await dialog.showOpenDialog(mainWindow, {
		title: "Choose data vault location",
		defaultPath: path.dirname(getCurrentDbPath()),
		properties: ["openDirectory", "createDirectory"],
	});

	if (result.canceled || !result.filePaths[0]) return;

	const newDir = result.filePaths[0];
	const newDbPath = path.join(newDir, "todometer.db");
	const currentDbPath = getCurrentDbPath();

	if (newDbPath === currentDbPath) return;

	try {
		db.exportTo(newDbPath);
		db.closeDatabase();
		db.openDatabase(newDbPath);
		store.set("vaultPath", newDir);

		// Rebuild menu to update vault location display
		menuSetup();

		dialog.showMessageBox(mainWindow, {
			type: "info",
			title: "Data vault Moved",
			message: "Your data vault has been moved successfully.",
			detail: `New location: ${newDir}`,
		});
	} catch (err) {
		console.error("Failed to move data vault:", err);
		// Try to reopen original DB
		try {
			db.openDatabase(currentDbPath);
		} catch (_reopenErr) {
			// Critical failure
		}
		dialog.showMessageBox(mainWindow, {
			type: "error",
			title: "Move Failed",
			message: "Could not move the data vault.",
			detail: err.message,
		});
	}
}

async function resetVaultLocation() {
	if (!hasMainWindow()) return;

	const defaultPath = getDefaultDbPath();
	const currentDbPath = getCurrentDbPath();

	if (currentDbPath === defaultPath) {
		dialog.showMessageBox(mainWindow, {
			type: "info",
			title: "Already Default",
			message: "The data vault is already in the default location.",
		});
		return;
	}

	try {
		db.exportTo(defaultPath);
		db.closeDatabase();
		db.openDatabase(defaultPath);
		store.delete("vaultPath");
		menuSetup();

		dialog.showMessageBox(mainWindow, {
			type: "info",
			title: "Data vault Reset",
			message: "Your data vault has been moved back to the default location.",
			detail: path.dirname(defaultPath),
		});
	} catch (err) {
		console.error("Failed to reset data vault:", err);
		try {
			db.openDatabase(currentDbPath);
		} catch (_reopenErr) {
			// Critical failure
		}
		dialog.showMessageBox(mainWindow, {
			type: "error",
			title: "Reset Failed",
			message: "Could not reset the data vault location.",
			detail: err.message,
		});
	}
}

function revealVault() {
	const dbPath = getCurrentDbPath();
	shell.showItemInFolder(dbPath);
}

function notifyRendererDbChanged() {
	if (hasMainWindow()) {
		mainWindow.webContents.send("db:changed");
	}
}

function registerIpcHandlers() {
	ipcMain.handle("db:loadState", () => {
		return db.loadState();
	});

	ipcMain.handle("db:getAllItems", () => {
		return db.getAllItems();
	});

	ipcMain.handle("db:addItem", (_event, item) => {
		return db.addItem(item);
	});

	ipcMain.handle("db:updateItem", (_event, item) => {
		return db.updateItem(item);
	});

	ipcMain.handle("db:deleteItem", (_event, id) => {
		db.deleteItem(id);
		return { success: true };
	});

	ipcMain.handle("db:setItems", (_event, items) => {
		return db.setItems(items);
	});

	ipcMain.handle("db:saveDate", (_event, date) => {
		db.saveDate(date);
		return { success: true };
	});

	ipcMain.handle("db:migrate", (_event, state) => {
		return db.migrateFromLocalStorage(state);
	});

	// Settings IPC handlers
	ipcMain.handle("settings:getNotifications", () => {
		return { ...notificationSettings };
	});

	ipcMain.handle("settings:setNotifications", (_event, settings) => {
		if (settings.resetNotification !== undefined) {
			notificationSettings.resetNotification = settings.resetNotification;
			store.set("reset", settings.resetNotification);
		}
		if (settings.reminderNotification !== undefined) {
			notificationSettings.reminderNotification = settings.reminderNotification;
			store.set("reminder", settings.reminderNotification);
		}
		if (hasMainWindow()) {
			mainWindow.webContents.send(
				"notificationSettingsChange",
				notificationSettings,
			);
		}
		return { ...notificationSettings };
	});

	ipcMain.handle("settings:showTestNotification", () => {
		showNotification({
			title: "todometer reminder!",
			body: "Here's an example todometer notification!",
			silent: false,
		});
		return { success: true };
	});

	ipcMain.handle("settings:getVaultPath", () => {
		return {
			path: store.get("vaultPath") || null,
			defaultPath: path.dirname(getDefaultDbPath()),
			currentPath: path.dirname(getCurrentDbPath()),
		};
	});

	ipcMain.handle("settings:changeVault", async () => {
		await changeVaultLocation();
		return {
			path: store.get("vaultPath") || null,
			currentPath: path.dirname(getCurrentDbPath()),
		};
	});

	ipcMain.handle("settings:resetVault", async () => {
		await resetVaultLocation();
		return {
			path: store.get("vaultPath") || null,
			currentPath: path.dirname(getCurrentDbPath()),
		};
	});

	ipcMain.handle("settings:revealVault", () => {
		revealVault();
		return { success: true };
	});

	ipcMain.handle("settings:getApiState", () => {
		return {
			enabled: apiServer.isApiServerRunning(),
			port: apiServer.getDefaultPort(),
			token: store.get("apiToken") || null,
			mcpPath: path.join(app.getAppPath(), "src", "mcp", "index.js"),
		};
	});

	ipcMain.handle("settings:toggleApi", (_event, enable) => {
		if (enable) {
			let token = store.get("apiToken");
			if (!token) {
				token = apiServer.generateApiToken();
				store.set("apiToken", token);
			}
			apiServer.startApiServer(token, undefined, notifyRendererDbChanged);
			store.set("apiEnabled", true);
			return {
				enabled: true,
				port: apiServer.getDefaultPort(),
				token,
			};
		} else {
			apiServer.stopApiServer();
			store.set("apiEnabled", false);
			return {
				enabled: false,
				port: apiServer.getDefaultPort(),
				token: store.get("apiToken") || null,
			};
		}
	});

	ipcMain.handle("settings:copyApiToken", () => {
		const token = store.get("apiToken");
		if (token) {
			const { clipboard } = require("electron");
			clipboard.writeText(token);
			return { success: true, copied: true };
		}
		return { success: false, copied: false };
	});

	ipcMain.handle("settings:getShowResetButton", () => {
		return store.get("showResetButton") ?? true;
	});

	ipcMain.handle("settings:setShowResetButton", (_event, show) => {
		store.set("showResetButton", show);
		return show;
	});

	ipcMain.handle("settings:getShowCopyButton", () => {
		return store.get("showCopyButton") ?? false;
	});

	ipcMain.handle("settings:setShowCopyButton", (_event, show) => {
		store.set("showCopyButton", show);
		return show;
	});
}

function showNotification({ title, body, silent = false }) {
	if (!Notification.isSupported()) {
		return;
	}

	if (!silent) {
		playNotificationSound();
	}

	const notification = new Notification({
		title,
		body,
		silent: process.platform === "win32" ? true : silent,
	});
	notification.show();
}

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 800,
		minWidth: 320,
		height: 600,
		fullscreenable: true,
		backgroundColor: "#403F4D",
		icon: path.join(app.getAppPath(), "assets/png/128.png"),
		webPreferences: {
			preload: path.join(app.getAppPath(), "dist/preload/index.cjs"),
			contextIsolation: true,
			nodeIntegration: false,
		},
	});

	mainWindow.loadURL(
		isDev
			? "http://localhost:5173"
			: new URL(
					"../dist/renderer/index.html",
					"file://" + __dirname,
				).toString(),
	);
}

function setupAutoUpdater() {
	if (!app.isPackaged) {
		return;
	}

	autoUpdater.autoDownload = true;
	autoUpdater.autoInstallOnAppQuit = true;

	autoUpdater.on("update-available", (info) => {
		console.log("Update available:", info.version);
		if (isCheckingForUpdatesManually && hasMainWindow()) {
			dialog.showMessageBox(mainWindow, {
				type: "info",
				title: "Update Available",
				message: `A new version (v${info.version}) is being downloaded.`,
				detail: "You'll be notified when it's ready to install.",
			});
		}
	});

	autoUpdater.on("update-not-available", () => {
		if (isCheckingForUpdatesManually && hasMainWindow()) {
			dialog.showMessageBox(mainWindow, {
				type: "info",
				title: "No Updates",
				message: "You're running the latest version of todometer!",
			});
		}
		isCheckingForUpdatesManually = false;
	});

	autoUpdater.on("download-progress", (progress) => {
		console.log(`Download progress: ${Math.round(progress.percent)}%`);
	});

	autoUpdater.on("update-downloaded", (info) => {
		isCheckingForUpdatesManually = false;

		if (!hasMainWindow()) {
			return;
		}

		dialog
			.showMessageBox(mainWindow, {
				type: "info",
				title: "Update Ready",
				message: `Version ${info.version} has been downloaded.`,
				detail: "Restart todometer now to apply the update?",
				buttons: ["Restart", "Later"],
				defaultId: 0,
				cancelId: 1,
			})
			.then(({ response }) => {
				if (response === 0) {
					autoUpdater.quitAndInstall();
				}
			});
	});

	autoUpdater.on("error", (err) => {
		console.error("Auto-updater error:", err);
		if (isCheckingForUpdatesManually && hasMainWindow()) {
			dialog.showMessageBox(mainWindow, {
				type: "error",
				title: "Update Error",
				message: "Could not check for updates.",
				detail: err?.message || "Please try again later.",
			});
		}
		isCheckingForUpdatesManually = false;
	});

	autoUpdater.checkForUpdates().catch(() => {});
}

function checkForUpdatesManually() {
	if (!app.isPackaged) {
		if (hasMainWindow()) {
			dialog.showMessageBox(mainWindow, {
				type: "info",
				title: "Dev Mode",
				message: "Auto-updates are disabled in development mode.",
			});
		}
		return;
	}

	if (process.platform === "linux" && !process.env.APPIMAGE) {
		shell.openExternal("https://github.com/cassidoo/todometer/releases/latest");
		return;
	}

	isCheckingForUpdatesManually = true;
	autoUpdater.checkForUpdates().catch(() => {});
}

function menuSetup() {
	const menuTemplate = [
		{
			label: "todometer",
			submenu: [
				{
					label: "About",
					click: () => {
						dialog.showMessageBox(mainWindow, {
							type: "info",
							title: "About",
							message:
								"todometer is open source and lovingly built by cassidoo",
							detail: "You can find her on her website cassidoo.co.",
							icon: path.join(app.getAppPath(), "assets/png/64.png"),
						});
					},
				},
				{
					label: "Contribute (v" + version + ")",
					click: () => {
						shell.openExternal("https://github.com/cassidoo/todometer");
					},
				},
				{
					label: "Check for Updates…",
					click: () => {
						checkForUpdatesManually();
					},
				},
				{
					type: "separator",
				},
				/*{
					// For debugging
					label: "Dev tools",
					click: () => {
						mainWindow.webContents.openDevTools();
					},
				},*/
				{
					label: "Quit",
					accelerator: "CommandOrControl+Q",
					click: () => {
						app.quit();
					},
				},
			],
		},
		{
			label: "Edit",
			submenu: [
				{ role: "undo" },
				{ role: "redo" },
				{ role: "cut" },
				{ role: "copy" },
				{ role: "paste" },
				{ role: "delete" },
				{ role: "selectall" },
			],
		},
		{
			label: "View",
			submenu: [
				{
					type: "separator",
				},
				{ role: "reload" },
				{
					label: "Zoom In",
					accelerator: "CommandOrControl+=",
					click: () => {
						const wc = mainWindow.webContents;
						wc.setZoomLevel(wc.getZoomLevel() + 0.5);
					},
				},
				{
					label: "Zoom Out",
					accelerator: "CommandOrControl+-",
					click: () => {
						const wc = mainWindow.webContents;
						wc.setZoomLevel(wc.getZoomLevel() - 0.5);
					},
				},
				{
					label: "Reset Zoom",
					accelerator: "CommandOrControl+0",
					click: () => mainWindow.webContents.setZoomLevel(0),
				},
				{ role: "togglefullscreen" },
				{ role: "minimize" },
			],
		},
	];
	const menu = Menu.buildFromTemplate(menuTemplate);
	Menu.setApplicationMenu(menu);
}

if (gotTheLock) {
	app.on("second-instance", (_event, argv) => {
		// On Windows/Linux, protocol URLs are passed as argv
		const protocolUrl = argv.find((arg) => arg.startsWith("todometer://"));
		if (protocolUrl) {
			handleProtocolUrl(protocolUrl);
		}

		if (!showAndFocusMainWindow()) {
			createWindow();
		}
	});

	app.on("ready", () => {
		initDatabase();
		registerIpcHandlers();

		// Auto-start API server if previously enabled
		if (store.get("apiEnabled")) {
			const token = store.get("apiToken");
			if (token) {
				apiServer.startApiServer(token, undefined, notifyRendererDbChanged);
			}
		}

		createWindow();
		menuSetup();
		setupAutoUpdater();
		processPendingUrls();

		ipcMain.on("showNotification", (_event, payload) => {
			if (!payload || typeof payload !== "object") {
				return;
			}

			const title = String(payload.title ?? "todometer");
			const body = String(payload.body ?? "");
			const silent = Boolean(payload.silent);

			showNotification({ title, body, silent });
		});

		mainWindow.webContents.on("did-finish-load", () => {
			mainWindow.webContents.send(
				"notificationSettingsChange",
				notificationSettings,
			);
		});

		powerMonitor.on("resume", () => {
			if (hasMainWindow()) {
				mainWindow.reload();
			}
		});

		// On Windows, closing exits; on macOS/Linux, closing hides unless quitting.
		mainWindow.on("close", (e) => {
			if (willQuit || process.platform === "win32") {
				mainWindow = null;
				app.quit();
			} else {
				e.preventDefault();
				mainWindow.hide();
			}
		});
	});

	app.on("activate", () => {
		if (!showAndFocusMainWindow()) {
			createWindow();
		}
	});

	app.on("before-quit", () => {
		willQuit = true;
		apiServer.stopApiServer();
		db.closeDatabase();
	});
}
