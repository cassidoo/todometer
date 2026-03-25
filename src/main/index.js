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

let notificationSettings = {
	resetNotification: store.get("reset") ?? true,
	reminderNotification: store.get("reminder") ?? "hour",
};

let mainWindow = null;
let willQuit = false;
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
		icon: path.join(app.getAppPath(), "assets/png/128x128.png"),
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
							icon: path.join(app.getAppPath(), "assets/png/64x64.png"),
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
					type: "separator",
				},
				{
					/* For debugging */
					label: "Dev tools",
					click: () => {
						mainWindow.webContents.openDevTools();
					},
				},
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
					checked: store.get("reset"),
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
							checked: store.get("reminder") === "never",
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
							checked: store.get("reminder") === "fiveminutes",
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
							checked: store.get("reminder") === "quarterhour",
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
							checked: store.get("reminder") === "halfhour",
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
							checked: store.get("reminder") === "hour",
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
