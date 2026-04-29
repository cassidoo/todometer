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
import { version } from "../../package.json";

const unwrapDefault = (mod) => mod?.default?.default ?? mod?.default ?? mod;
const Store = unwrapDefault(StoreModule);
const isDev = unwrapDefault(isDevModule);
const store = new Store();

if (process.platform === "win32") {
	app.setAppUserModelId(process.execPath);
}

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
				// {
				//   label: "Light mode",
				//   type: "checkbox",
				//   checked: false,
				//   click: e => {
				//     mainWindow.isLightMode = e.checked;
				//   }
				// },
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
		{
			label: "Notifications",
			submenu: [
				{
					label: "Enable reset notification",
					type: "checkbox",
					checked: notificationSettings.resetNotification,
					click: (e) => {
						notificationSettings.resetNotification = e.checked;
						mainWindow.webContents.send(
							"notificationSettingsChange",
							notificationSettings,
						);
						store.set("reset", e.checked);
					},
				},
				{
					label: "Reminder notifications",
					submenu: [
						{
							label: "Never",
							type: "radio",
							checked: notificationSettings.reminderNotification === "never",
							click: (e) => {
								if (e.checked) {
									notificationSettings.reminderNotification = "never";
									mainWindow.webContents.send(
										"notificationSettingsChange",
										notificationSettings,
									);
									store.set("reminder", "never");
								}
							},
						},
						{
							label: "Every 5 minutes",
							type: "radio",
							checked:
								notificationSettings.reminderNotification === "fiveminutes",
							click: (e) => {
								if (e.checked) {
									notificationSettings.reminderNotification = "fiveminutes";
									mainWindow.webContents.send(
										"notificationSettingsChange",
										notificationSettings,
									);
									store.set("reminder", "fiveminutes");
								}
							},
						},
						{
							label: "Every 15 minutes",
							type: "radio",
							checked:
								notificationSettings.reminderNotification === "quarterhour",
							click: (e) => {
								if (e.checked) {
									notificationSettings.reminderNotification = "quarterhour";
									mainWindow.webContents.send(
										"notificationSettingsChange",
										notificationSettings,
									);
									store.set("reminder", "quarterhour");
								}
							},
						},
						{
							label: "Every 30 minutes",
							type: "radio",
							checked: notificationSettings.reminderNotification === "halfhour",
							click: (e) => {
								if (e.checked) {
									notificationSettings.reminderNotification = "halfhour";
									mainWindow.webContents.send(
										"notificationSettingsChange",
										notificationSettings,
									);
									store.set("reminder", "halfhour");
								}
							},
						},
						{
							label: "Every hour",
							type: "radio",
							checked: notificationSettings.reminderNotification === "hour",
							click: (e) => {
								if (e.checked) {
									notificationSettings.reminderNotification = "hour";
									mainWindow.webContents.send(
										"notificationSettingsChange",
										notificationSettings,
									);
									store.set("reminder", "hour");
								}
							},
						},
					],
				},
				{
					label: "Show example notification",
					click: (e) => {
						showNotification({
							title: "todometer reminder!",
							body: "Here's an example todometer notification!",
							silent: false,
						});
					},
				},
			],
		},
	];
	const menu = Menu.buildFromTemplate(menuTemplate);
	Menu.setApplicationMenu(menu);
}

if (gotTheLock) {
	app.on("second-instance", () => {
		if (!showAndFocusMainWindow()) {
			createWindow();
		}
	});

	app.on("ready", () => {
		createWindow();
		menuSetup();
		setupAutoUpdater();

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

	app.on("before-quit", () => (willQuit = true));
}
