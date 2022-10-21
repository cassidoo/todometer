"use strict";
const electron = require("electron");
const Store = require("electron-store");
const isDev = require("electron-is-dev");
const path = require("path");
const _interopDefaultLegacy = (e) => e && typeof e === "object" && "default" in e ? e : { default: e };
const Store__default = /* @__PURE__ */ _interopDefaultLegacy(Store);
const isDev__default = /* @__PURE__ */ _interopDefaultLegacy(isDev);
const path__default = /* @__PURE__ */ _interopDefaultLegacy(path);
const version = "2";
const store = new Store__default.default();
global.notificationSettings = {
  resetNotification: store.get("reset") || true,
  reminderNotification: store.get("reminder") || "hour"
};
let mainWindow = {
  show: () => {
    console.log("show");
  }
};
let willQuit = false;
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 800,
    minWidth: 320,
    height: 600,
    fullscreenable: true,
    backgroundColor: "#403F4D",
    icon: path__default.default.join(__dirname, "assets/png/128x128.png"),
    webPreferences: {
      nodeIntegration: true
    }
  });
  mainWindow.loadURL(
    isDev__default.default ? "http://localhost:5173" : `file://${path__default.default.join(__dirname, "../build/index.html")}`
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
            electron.dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "About",
              message: "todometer is built by @cassidoo",
              detail: "You can find her on GitHub and Twitter as @cassidoo, or on her website cassidoo.co.",
              icon: path__default.default.join(__dirname, "assets/png/64x64.png")
            });
          }
        },
        {
          label: "Contribute (v" + version + ")",
          click: () => {
            electron.shell.openExternal("https://github.com/cassidoo/todometer");
          }
        },
        {
          type: "separator"
        },
        {
          label: "Dev tools",
          click: () => {
            mainWindow.webContents.openDevTools();
          }
        },
        {
          label: "Quit",
          accelerator: "CommandOrControl+Q",
          click: () => {
            electron.app.quit();
          }
        }
      ]
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
        { role: "selectall" }
      ]
    },
    {
      label: "View",
      submenu: [
        {
          type: "separator"
        },
        { role: "reload" },
        { role: "togglefullscreen" },
        { role: "minimize" },
        { role: "close" }
      ]
    },
    {
      label: "Notifications",
      submenu: [
        {
          label: "Enable reset notification",
          type: "checkbox",
          checked: store.get("reset"),
          click: (e) => {
            global.notificationSettings.resetNotification = e.checked;
            store.set("reset", e.checked);
          }
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
                  global.notificationSettings.reminderNotification = "never";
                  store.set("reminder", "never");
                }
              }
            },
            {
              label: "Every 15 minutes",
              type: "radio",
              checked: store.get("reminder") === "quarterhour",
              click: (e) => {
                if (e.checked) {
                  global.notificationSettings.reminderNotification = "quarterhour";
                  store.set("reminder", "quarterhour");
                }
              }
            },
            {
              label: "Every 30 minutes",
              type: "radio",
              checked: store.get("reminder") === "halfhour",
              click: (e) => {
                if (e.checked) {
                  global.notificationSettings.reminderNotification = "halfhour";
                  store.set("reminder", "halfhour");
                }
              }
            },
            {
              label: "Every hour",
              type: "radio",
              checked: store.get("reminder") === "hour",
              click: (e) => {
                if (e.checked) {
                  mainWindow.reminderNotification = "hour";
                  store.set("reminder", "hour");
                }
              }
            }
          ]
        },
        {
          label: "Show example notification",
          click: (e) => {
            let exNotification = new electron.Notification({
              title: "todometer reminder!",
              body: "Here's an example todometer notification!"
            });
            exNotification.show();
          }
        }
      ]
    }
  ];
  const menu = electron.Menu.buildFromTemplate(menuTemplate);
  electron.Menu.setApplicationMenu(menu);
}
electron.app.on("ready", () => {
  createWindow();
  menuSetup();
  electron.powerMonitor.on("resume", () => {
    mainWindow.reload();
  });
  mainWindow.on("close", (e) => {
    if (willQuit || process.platform === "win32") {
      mainWindow = null;
      electron.app.quit();
    } else {
      e.preventDefault();
      mainWindow.hide();
    }
  });
});
electron.app.on("activate", () => mainWindow.show());
electron.app.on("before-quit", () => willQuit = true);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguY2pzIiwic291cmNlcyI6WyIuLi9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBhcHAsXG4gIEJyb3dzZXJXaW5kb3csXG4gIE1lbnUsXG4gIGRpYWxvZyxcbiAgcG93ZXJNb25pdG9yLFxuICBzaGVsbCxcbiAgTm90aWZpY2F0aW9uLFxufSBmcm9tIFwiZWxlY3Ryb25cIjtcbmltcG9ydCBTdG9yZSBmcm9tIFwiZWxlY3Ryb24tc3RvcmVcIjtcbmltcG9ydCBpc0RldiBmcm9tIFwiZWxlY3Ryb24taXMtZGV2XCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuXG5jb25zdCB2ZXJzaW9uID0gXCIyXCI7XG5cbmNvbnN0IHN0b3JlID0gbmV3IFN0b3JlKCk7XG5cbmdsb2JhbC5ub3RpZmljYXRpb25TZXR0aW5ncyA9IHtcbiAgcmVzZXROb3RpZmljYXRpb246IHN0b3JlLmdldChcInJlc2V0XCIpIHx8IHRydWUsXG4gIHJlbWluZGVyTm90aWZpY2F0aW9uOiBzdG9yZS5nZXQoXCJyZW1pbmRlclwiKSB8fCBcImhvdXJcIixcbn07XG5cbmxldCBtYWluV2luZG93ID0ge1xuICBzaG93OiAoKSA9PiB7XG4gICAgY29uc29sZS5sb2coXCJzaG93XCIpO1xuICB9LFxufTsgLy8gdGVtcCBvYmplY3Qgd2hpbGUgYXBwIGxvYWRzXG5sZXQgd2lsbFF1aXQgPSBmYWxzZTtcblxuZnVuY3Rpb24gY3JlYXRlV2luZG93KCkge1xuICBtYWluV2luZG93ID0gbmV3IEJyb3dzZXJXaW5kb3coe1xuICAgIHdpZHRoOiA4MDAsXG4gICAgbWluV2lkdGg6IDMyMCxcbiAgICBoZWlnaHQ6IDYwMCxcbiAgICBmdWxsc2NyZWVuYWJsZTogdHJ1ZSxcbiAgICBiYWNrZ3JvdW5kQ29sb3I6IFwiIzQwM0Y0RFwiLFxuICAgIGljb246IHBhdGguam9pbihfX2Rpcm5hbWUsIFwiYXNzZXRzL3BuZy8xMjh4MTI4LnBuZ1wiKSxcbiAgICB3ZWJQcmVmZXJlbmNlczoge1xuICAgICAgbm9kZUludGVncmF0aW9uOiB0cnVlLFxuICAgIH0sXG4gIH0pO1xuXG4gIG1haW5XaW5kb3cubG9hZFVSTChcbiAgICBpc0RldlxuICAgICAgPyBcImh0dHA6Ly9sb2NhbGhvc3Q6NTE3M1wiXG4gICAgICA6IGBmaWxlOi8vJHtwYXRoLmpvaW4oX19kaXJuYW1lLCBcIi4uL2J1aWxkL2luZGV4Lmh0bWxcIil9YFxuICApO1xufVxuXG5mdW5jdGlvbiBtZW51U2V0dXAoKSB7XG4gIGNvbnN0IG1lbnVUZW1wbGF0ZSA9IFtcbiAgICB7XG4gICAgICBsYWJlbDogXCJ0b2RvbWV0ZXJcIixcbiAgICAgIHN1Ym1lbnU6IFtcbiAgICAgICAge1xuICAgICAgICAgIGxhYmVsOiBcIkFib3V0XCIsXG4gICAgICAgICAgY2xpY2s6ICgpID0+IHtcbiAgICAgICAgICAgIGRpYWxvZy5zaG93TWVzc2FnZUJveChtYWluV2luZG93LCB7XG4gICAgICAgICAgICAgIHR5cGU6IFwiaW5mb1wiLFxuICAgICAgICAgICAgICB0aXRsZTogXCJBYm91dFwiLFxuICAgICAgICAgICAgICBtZXNzYWdlOiBcInRvZG9tZXRlciBpcyBidWlsdCBieSBAY2Fzc2lkb29cIixcbiAgICAgICAgICAgICAgZGV0YWlsOlxuICAgICAgICAgICAgICAgIFwiWW91IGNhbiBmaW5kIGhlciBvbiBHaXRIdWIgYW5kIFR3aXR0ZXIgYXMgQGNhc3NpZG9vLCBvciBvbiBoZXIgd2Vic2l0ZSBjYXNzaWRvby5jby5cIixcbiAgICAgICAgICAgICAgaWNvbjogcGF0aC5qb2luKF9fZGlybmFtZSwgXCJhc3NldHMvcG5nLzY0eDY0LnBuZ1wiKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBsYWJlbDogXCJDb250cmlidXRlICh2XCIgKyB2ZXJzaW9uICsgXCIpXCIsXG4gICAgICAgICAgY2xpY2s6ICgpID0+IHtcbiAgICAgICAgICAgIHNoZWxsLm9wZW5FeHRlcm5hbChcImh0dHBzOi8vZ2l0aHViLmNvbS9jYXNzaWRvby90b2RvbWV0ZXJcIik7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6IFwic2VwYXJhdG9yXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAvKiBGb3IgZGVidWdnaW5nICovXG4gICAgICAgICAgbGFiZWw6IFwiRGV2IHRvb2xzXCIsXG4gICAgICAgICAgY2xpY2s6ICgpID0+IHtcbiAgICAgICAgICAgIG1haW5XaW5kb3cud2ViQ29udGVudHMub3BlbkRldlRvb2xzKCk7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGxhYmVsOiBcIlF1aXRcIixcbiAgICAgICAgICBhY2NlbGVyYXRvcjogXCJDb21tYW5kT3JDb250cm9sK1FcIixcbiAgICAgICAgICBjbGljazogKCkgPT4ge1xuICAgICAgICAgICAgYXBwLnF1aXQoKTtcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGxhYmVsOiBcIkVkaXRcIixcbiAgICAgIHN1Ym1lbnU6IFtcbiAgICAgICAgeyByb2xlOiBcInVuZG9cIiB9LFxuICAgICAgICB7IHJvbGU6IFwicmVkb1wiIH0sXG4gICAgICAgIHsgcm9sZTogXCJjdXRcIiB9LFxuICAgICAgICB7IHJvbGU6IFwiY29weVwiIH0sXG4gICAgICAgIHsgcm9sZTogXCJwYXN0ZVwiIH0sXG4gICAgICAgIHsgcm9sZTogXCJkZWxldGVcIiB9LFxuICAgICAgICB7IHJvbGU6IFwic2VsZWN0YWxsXCIgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICBsYWJlbDogXCJWaWV3XCIsXG4gICAgICBzdWJtZW51OiBbXG4gICAgICAgIC8vIHtcbiAgICAgICAgLy8gICBsYWJlbDogXCJMaWdodCBtb2RlXCIsXG4gICAgICAgIC8vICAgdHlwZTogXCJjaGVja2JveFwiLFxuICAgICAgICAvLyAgIGNoZWNrZWQ6IGZhbHNlLFxuICAgICAgICAvLyAgIGNsaWNrOiBlID0+IHtcbiAgICAgICAgLy8gICAgIG1haW5XaW5kb3cuaXNMaWdodE1vZGUgPSBlLmNoZWNrZWQ7XG4gICAgICAgIC8vICAgfVxuICAgICAgICAvLyB9LFxuICAgICAgICB7XG4gICAgICAgICAgdHlwZTogXCJzZXBhcmF0b3JcIixcbiAgICAgICAgfSxcbiAgICAgICAgeyByb2xlOiBcInJlbG9hZFwiIH0sXG4gICAgICAgIHsgcm9sZTogXCJ0b2dnbGVmdWxsc2NyZWVuXCIgfSxcbiAgICAgICAgeyByb2xlOiBcIm1pbmltaXplXCIgfSxcbiAgICAgICAgeyByb2xlOiBcImNsb3NlXCIgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICBsYWJlbDogXCJOb3RpZmljYXRpb25zXCIsXG4gICAgICBzdWJtZW51OiBbXG4gICAgICAgIHtcbiAgICAgICAgICBsYWJlbDogXCJFbmFibGUgcmVzZXQgbm90aWZpY2F0aW9uXCIsXG4gICAgICAgICAgdHlwZTogXCJjaGVja2JveFwiLFxuICAgICAgICAgIGNoZWNrZWQ6IHN0b3JlLmdldChcInJlc2V0XCIpLFxuICAgICAgICAgIGNsaWNrOiAoZSkgPT4ge1xuICAgICAgICAgICAgZ2xvYmFsLm5vdGlmaWNhdGlvblNldHRpbmdzLnJlc2V0Tm90aWZpY2F0aW9uID0gZS5jaGVja2VkO1xuICAgICAgICAgICAgc3RvcmUuc2V0KFwicmVzZXRcIiwgZS5jaGVja2VkKTtcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbGFiZWw6IFwiUmVtaW5kZXIgbm90aWZpY2F0aW9uc1wiLFxuICAgICAgICAgIHN1Ym1lbnU6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbGFiZWw6IFwiTmV2ZXJcIixcbiAgICAgICAgICAgICAgdHlwZTogXCJyYWRpb1wiLFxuICAgICAgICAgICAgICBjaGVja2VkOiBzdG9yZS5nZXQoXCJyZW1pbmRlclwiKSA9PT0gXCJuZXZlclwiLFxuICAgICAgICAgICAgICBjbGljazogKGUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZS5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgICBnbG9iYWwubm90aWZpY2F0aW9uU2V0dGluZ3MucmVtaW5kZXJOb3RpZmljYXRpb24gPSBcIm5ldmVyXCI7XG4gICAgICAgICAgICAgICAgICBzdG9yZS5zZXQoXCJyZW1pbmRlclwiLCBcIm5ldmVyXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGxhYmVsOiBcIkV2ZXJ5IDE1IG1pbnV0ZXNcIixcbiAgICAgICAgICAgICAgdHlwZTogXCJyYWRpb1wiLFxuICAgICAgICAgICAgICBjaGVja2VkOiBzdG9yZS5nZXQoXCJyZW1pbmRlclwiKSA9PT0gXCJxdWFydGVyaG91clwiLFxuICAgICAgICAgICAgICBjbGljazogKGUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZS5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgICBnbG9iYWwubm90aWZpY2F0aW9uU2V0dGluZ3MucmVtaW5kZXJOb3RpZmljYXRpb24gPVxuICAgICAgICAgICAgICAgICAgICBcInF1YXJ0ZXJob3VyXCI7XG4gICAgICAgICAgICAgICAgICBzdG9yZS5zZXQoXCJyZW1pbmRlclwiLCBcInF1YXJ0ZXJob3VyXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGxhYmVsOiBcIkV2ZXJ5IDMwIG1pbnV0ZXNcIixcbiAgICAgICAgICAgICAgdHlwZTogXCJyYWRpb1wiLFxuICAgICAgICAgICAgICBjaGVja2VkOiBzdG9yZS5nZXQoXCJyZW1pbmRlclwiKSA9PT0gXCJoYWxmaG91clwiLFxuICAgICAgICAgICAgICBjbGljazogKGUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZS5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgICBnbG9iYWwubm90aWZpY2F0aW9uU2V0dGluZ3MucmVtaW5kZXJOb3RpZmljYXRpb24gPSBcImhhbGZob3VyXCI7XG4gICAgICAgICAgICAgICAgICBzdG9yZS5zZXQoXCJyZW1pbmRlclwiLCBcImhhbGZob3VyXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGxhYmVsOiBcIkV2ZXJ5IGhvdXJcIixcbiAgICAgICAgICAgICAgdHlwZTogXCJyYWRpb1wiLFxuICAgICAgICAgICAgICBjaGVja2VkOiBzdG9yZS5nZXQoXCJyZW1pbmRlclwiKSA9PT0gXCJob3VyXCIsXG4gICAgICAgICAgICAgIGNsaWNrOiAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlLmNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICAgIG1haW5XaW5kb3cucmVtaW5kZXJOb3RpZmljYXRpb24gPSBcImhvdXJcIjtcbiAgICAgICAgICAgICAgICAgIHN0b3JlLnNldChcInJlbWluZGVyXCIsIFwiaG91clwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBsYWJlbDogXCJTaG93IGV4YW1wbGUgbm90aWZpY2F0aW9uXCIsXG4gICAgICAgICAgY2xpY2s6IChlKSA9PiB7XG4gICAgICAgICAgICBsZXQgZXhOb3RpZmljYXRpb24gPSBuZXcgTm90aWZpY2F0aW9uKHtcbiAgICAgICAgICAgICAgdGl0bGU6IFwidG9kb21ldGVyIHJlbWluZGVyIVwiLFxuICAgICAgICAgICAgICBib2R5OiBcIkhlcmUncyBhbiBleGFtcGxlIHRvZG9tZXRlciBub3RpZmljYXRpb24hXCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGV4Tm90aWZpY2F0aW9uLnNob3coKTtcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICBdO1xuICBjb25zdCBtZW51ID0gTWVudS5idWlsZEZyb21UZW1wbGF0ZShtZW51VGVtcGxhdGUpO1xuICBNZW51LnNldEFwcGxpY2F0aW9uTWVudShtZW51KTtcbn1cblxuYXBwLm9uKFwicmVhZHlcIiwgKCkgPT4ge1xuICBjcmVhdGVXaW5kb3coKTtcbiAgbWVudVNldHVwKCk7XG5cbiAgcG93ZXJNb25pdG9yLm9uKFwicmVzdW1lXCIsICgpID0+IHtcbiAgICBtYWluV2luZG93LnJlbG9hZCgpO1xuICB9KTtcblxuICAvLyBPbiBNYWMsIHRoaXMgd2lsbCBoaWRlIHRoZSB3aW5kb3dcbiAgLy8gT24gV2luZG93cywgdGhlIGFwcCB3aWxsIGNsb3NlIGFuZCBxdWl0XG4gIG1haW5XaW5kb3cub24oXCJjbG9zZVwiLCAoZSkgPT4ge1xuICAgIGlmICh3aWxsUXVpdCB8fCBwcm9jZXNzLnBsYXRmb3JtID09PSBcIndpbjMyXCIpIHtcbiAgICAgIG1haW5XaW5kb3cgPSBudWxsO1xuICAgICAgYXBwLnF1aXQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgbWFpbldpbmRvdy5oaWRlKCk7XG4gICAgfVxuICB9KTtcbn0pO1xuXG5hcHAub24oXCJhY3RpdmF0ZVwiLCAoKSA9PiBtYWluV2luZG93LnNob3coKSk7XG5hcHAub24oXCJiZWZvcmUtcXVpdFwiLCAoKSA9PiAod2lsbFF1aXQgPSB0cnVlKSk7XG4iXSwibmFtZXMiOlsiU3RvcmUiLCJCcm93c2VyV2luZG93IiwicGF0aCIsImlzRGV2IiwiZGlhbG9nIiwic2hlbGwiLCJhcHAiLCJOb3RpZmljYXRpb24iLCJNZW51IiwicG93ZXJNb25pdG9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7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
