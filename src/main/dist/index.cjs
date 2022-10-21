"use strict";
const electron = require("electron");
const Store = require("electron-store");
const isDev = require("electron-is-dev");
const path = require("path");
const _interopDefaultLegacy = (e) => e && typeof e === "object" && "default" in e ? e : { default: e };
const Store__default = /* @__PURE__ */ _interopDefaultLegacy(Store);
const isDev__default = /* @__PURE__ */ _interopDefaultLegacy(isDev);
const path__default = /* @__PURE__ */ _interopDefaultLegacy(path);
const version = "2.0.1";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguY2pzIiwic291cmNlcyI6WyIuLi9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBhcHAsXG4gIEJyb3dzZXJXaW5kb3csXG4gIE1lbnUsXG4gIGRpYWxvZyxcbiAgcG93ZXJNb25pdG9yLFxuICBzaGVsbCxcbiAgTm90aWZpY2F0aW9uLFxufSBmcm9tIFwiZWxlY3Ryb25cIjtcbmltcG9ydCBTdG9yZSBmcm9tIFwiZWxlY3Ryb24tc3RvcmVcIjtcbmltcG9ydCBpc0RldiBmcm9tIFwiZWxlY3Ryb24taXMtZGV2XCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgdmVyc2lvbiB9IGZyb20gXCIuLi8uLi9wYWNrYWdlLmpzb25cIjtcblxuY29uc3Qgc3RvcmUgPSBuZXcgU3RvcmUoKTtcblxuZ2xvYmFsLm5vdGlmaWNhdGlvblNldHRpbmdzID0ge1xuICByZXNldE5vdGlmaWNhdGlvbjogc3RvcmUuZ2V0KFwicmVzZXRcIikgfHwgdHJ1ZSxcbiAgcmVtaW5kZXJOb3RpZmljYXRpb246IHN0b3JlLmdldChcInJlbWluZGVyXCIpIHx8IFwiaG91clwiLFxufTtcblxubGV0IG1haW5XaW5kb3cgPSB7XG4gIHNob3c6ICgpID0+IHtcbiAgICBjb25zb2xlLmxvZyhcInNob3dcIik7XG4gIH0sXG59OyAvLyB0ZW1wIG9iamVjdCB3aGlsZSBhcHAgbG9hZHNcbmxldCB3aWxsUXVpdCA9IGZhbHNlO1xuXG5mdW5jdGlvbiBjcmVhdGVXaW5kb3coKSB7XG4gIG1haW5XaW5kb3cgPSBuZXcgQnJvd3NlcldpbmRvdyh7XG4gICAgd2lkdGg6IDgwMCxcbiAgICBtaW5XaWR0aDogMzIwLFxuICAgIGhlaWdodDogNjAwLFxuICAgIGZ1bGxzY3JlZW5hYmxlOiB0cnVlLFxuICAgIGJhY2tncm91bmRDb2xvcjogXCIjNDAzRjREXCIsXG4gICAgaWNvbjogcGF0aC5qb2luKF9fZGlybmFtZSwgXCJhc3NldHMvcG5nLzEyOHgxMjgucG5nXCIpLFxuICAgIHdlYlByZWZlcmVuY2VzOiB7XG4gICAgICBub2RlSW50ZWdyYXRpb246IHRydWUsXG4gICAgfSxcbiAgfSk7XG5cbiAgbWFpbldpbmRvdy5sb2FkVVJMKFxuICAgIGlzRGV2XG4gICAgICA/IFwiaHR0cDovL2xvY2FsaG9zdDo1MTczXCJcbiAgICAgIDogYGZpbGU6Ly8ke3BhdGguam9pbihfX2Rpcm5hbWUsIFwiLi4vYnVpbGQvaW5kZXguaHRtbFwiKX1gXG4gICk7XG59XG5cbmZ1bmN0aW9uIG1lbnVTZXR1cCgpIHtcbiAgY29uc3QgbWVudVRlbXBsYXRlID0gW1xuICAgIHtcbiAgICAgIGxhYmVsOiBcInRvZG9tZXRlclwiLFxuICAgICAgc3VibWVudTogW1xuICAgICAgICB7XG4gICAgICAgICAgbGFiZWw6IFwiQWJvdXRcIixcbiAgICAgICAgICBjbGljazogKCkgPT4ge1xuICAgICAgICAgICAgZGlhbG9nLnNob3dNZXNzYWdlQm94KG1haW5XaW5kb3csIHtcbiAgICAgICAgICAgICAgdHlwZTogXCJpbmZvXCIsXG4gICAgICAgICAgICAgIHRpdGxlOiBcIkFib3V0XCIsXG4gICAgICAgICAgICAgIG1lc3NhZ2U6IFwidG9kb21ldGVyIGlzIGJ1aWx0IGJ5IEBjYXNzaWRvb1wiLFxuICAgICAgICAgICAgICBkZXRhaWw6XG4gICAgICAgICAgICAgICAgXCJZb3UgY2FuIGZpbmQgaGVyIG9uIEdpdEh1YiBhbmQgVHdpdHRlciBhcyBAY2Fzc2lkb28sIG9yIG9uIGhlciB3ZWJzaXRlIGNhc3NpZG9vLmNvLlwiLFxuICAgICAgICAgICAgICBpY29uOiBwYXRoLmpvaW4oX19kaXJuYW1lLCBcImFzc2V0cy9wbmcvNjR4NjQucG5nXCIpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGxhYmVsOiBcIkNvbnRyaWJ1dGUgKHZcIiArIHZlcnNpb24gKyBcIilcIixcbiAgICAgICAgICBjbGljazogKCkgPT4ge1xuICAgICAgICAgICAgc2hlbGwub3BlbkV4dGVybmFsKFwiaHR0cHM6Ly9naXRodWIuY29tL2Nhc3NpZG9vL3RvZG9tZXRlclwiKTtcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdHlwZTogXCJzZXBhcmF0b3JcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIC8qIEZvciBkZWJ1Z2dpbmcgKi9cbiAgICAgICAgICBsYWJlbDogXCJEZXYgdG9vbHNcIixcbiAgICAgICAgICBjbGljazogKCkgPT4ge1xuICAgICAgICAgICAgbWFpbldpbmRvdy53ZWJDb250ZW50cy5vcGVuRGV2VG9vbHMoKTtcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbGFiZWw6IFwiUXVpdFwiLFxuICAgICAgICAgIGFjY2VsZXJhdG9yOiBcIkNvbW1hbmRPckNvbnRyb2wrUVwiLFxuICAgICAgICAgIGNsaWNrOiAoKSA9PiB7XG4gICAgICAgICAgICBhcHAucXVpdCgpO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgbGFiZWw6IFwiRWRpdFwiLFxuICAgICAgc3VibWVudTogW1xuICAgICAgICB7IHJvbGU6IFwidW5kb1wiIH0sXG4gICAgICAgIHsgcm9sZTogXCJyZWRvXCIgfSxcbiAgICAgICAgeyByb2xlOiBcImN1dFwiIH0sXG4gICAgICAgIHsgcm9sZTogXCJjb3B5XCIgfSxcbiAgICAgICAgeyByb2xlOiBcInBhc3RlXCIgfSxcbiAgICAgICAgeyByb2xlOiBcImRlbGV0ZVwiIH0sXG4gICAgICAgIHsgcm9sZTogXCJzZWxlY3RhbGxcIiB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGxhYmVsOiBcIlZpZXdcIixcbiAgICAgIHN1Ym1lbnU6IFtcbiAgICAgICAgLy8ge1xuICAgICAgICAvLyAgIGxhYmVsOiBcIkxpZ2h0IG1vZGVcIixcbiAgICAgICAgLy8gICB0eXBlOiBcImNoZWNrYm94XCIsXG4gICAgICAgIC8vICAgY2hlY2tlZDogZmFsc2UsXG4gICAgICAgIC8vICAgY2xpY2s6IGUgPT4ge1xuICAgICAgICAvLyAgICAgbWFpbldpbmRvdy5pc0xpZ2h0TW9kZSA9IGUuY2hlY2tlZDtcbiAgICAgICAgLy8gICB9XG4gICAgICAgIC8vIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlOiBcInNlcGFyYXRvclwiLFxuICAgICAgICB9LFxuICAgICAgICB7IHJvbGU6IFwicmVsb2FkXCIgfSxcbiAgICAgICAgeyByb2xlOiBcInRvZ2dsZWZ1bGxzY3JlZW5cIiB9LFxuICAgICAgICB7IHJvbGU6IFwibWluaW1pemVcIiB9LFxuICAgICAgICB7IHJvbGU6IFwiY2xvc2VcIiB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGxhYmVsOiBcIk5vdGlmaWNhdGlvbnNcIixcbiAgICAgIHN1Ym1lbnU6IFtcbiAgICAgICAge1xuICAgICAgICAgIGxhYmVsOiBcIkVuYWJsZSByZXNldCBub3RpZmljYXRpb25cIixcbiAgICAgICAgICB0eXBlOiBcImNoZWNrYm94XCIsXG4gICAgICAgICAgY2hlY2tlZDogc3RvcmUuZ2V0KFwicmVzZXRcIiksXG4gICAgICAgICAgY2xpY2s6IChlKSA9PiB7XG4gICAgICAgICAgICBnbG9iYWwubm90aWZpY2F0aW9uU2V0dGluZ3MucmVzZXROb3RpZmljYXRpb24gPSBlLmNoZWNrZWQ7XG4gICAgICAgICAgICBzdG9yZS5zZXQoXCJyZXNldFwiLCBlLmNoZWNrZWQpO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBsYWJlbDogXCJSZW1pbmRlciBub3RpZmljYXRpb25zXCIsXG4gICAgICAgICAgc3VibWVudTogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBsYWJlbDogXCJOZXZlclwiLFxuICAgICAgICAgICAgICB0eXBlOiBcInJhZGlvXCIsXG4gICAgICAgICAgICAgIGNoZWNrZWQ6IHN0b3JlLmdldChcInJlbWluZGVyXCIpID09PSBcIm5ldmVyXCIsXG4gICAgICAgICAgICAgIGNsaWNrOiAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlLmNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICAgIGdsb2JhbC5ub3RpZmljYXRpb25TZXR0aW5ncy5yZW1pbmRlck5vdGlmaWNhdGlvbiA9IFwibmV2ZXJcIjtcbiAgICAgICAgICAgICAgICAgIHN0b3JlLnNldChcInJlbWluZGVyXCIsIFwibmV2ZXJcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbGFiZWw6IFwiRXZlcnkgMTUgbWludXRlc1wiLFxuICAgICAgICAgICAgICB0eXBlOiBcInJhZGlvXCIsXG4gICAgICAgICAgICAgIGNoZWNrZWQ6IHN0b3JlLmdldChcInJlbWluZGVyXCIpID09PSBcInF1YXJ0ZXJob3VyXCIsXG4gICAgICAgICAgICAgIGNsaWNrOiAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlLmNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICAgIGdsb2JhbC5ub3RpZmljYXRpb25TZXR0aW5ncy5yZW1pbmRlck5vdGlmaWNhdGlvbiA9XG4gICAgICAgICAgICAgICAgICAgIFwicXVhcnRlcmhvdXJcIjtcbiAgICAgICAgICAgICAgICAgIHN0b3JlLnNldChcInJlbWluZGVyXCIsIFwicXVhcnRlcmhvdXJcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbGFiZWw6IFwiRXZlcnkgMzAgbWludXRlc1wiLFxuICAgICAgICAgICAgICB0eXBlOiBcInJhZGlvXCIsXG4gICAgICAgICAgICAgIGNoZWNrZWQ6IHN0b3JlLmdldChcInJlbWluZGVyXCIpID09PSBcImhhbGZob3VyXCIsXG4gICAgICAgICAgICAgIGNsaWNrOiAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlLmNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICAgIGdsb2JhbC5ub3RpZmljYXRpb25TZXR0aW5ncy5yZW1pbmRlck5vdGlmaWNhdGlvbiA9IFwiaGFsZmhvdXJcIjtcbiAgICAgICAgICAgICAgICAgIHN0b3JlLnNldChcInJlbWluZGVyXCIsIFwiaGFsZmhvdXJcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbGFiZWw6IFwiRXZlcnkgaG91clwiLFxuICAgICAgICAgICAgICB0eXBlOiBcInJhZGlvXCIsXG4gICAgICAgICAgICAgIGNoZWNrZWQ6IHN0b3JlLmdldChcInJlbWluZGVyXCIpID09PSBcImhvdXJcIixcbiAgICAgICAgICAgICAgY2xpY2s6IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGUuY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgICAgbWFpbldpbmRvdy5yZW1pbmRlck5vdGlmaWNhdGlvbiA9IFwiaG91clwiO1xuICAgICAgICAgICAgICAgICAgc3RvcmUuc2V0KFwicmVtaW5kZXJcIiwgXCJob3VyXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGxhYmVsOiBcIlNob3cgZXhhbXBsZSBub3RpZmljYXRpb25cIixcbiAgICAgICAgICBjbGljazogKGUpID0+IHtcbiAgICAgICAgICAgIGxldCBleE5vdGlmaWNhdGlvbiA9IG5ldyBOb3RpZmljYXRpb24oe1xuICAgICAgICAgICAgICB0aXRsZTogXCJ0b2RvbWV0ZXIgcmVtaW5kZXIhXCIsXG4gICAgICAgICAgICAgIGJvZHk6IFwiSGVyZSdzIGFuIGV4YW1wbGUgdG9kb21ldGVyIG5vdGlmaWNhdGlvbiFcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZXhOb3RpZmljYXRpb24uc2hvdygpO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gIF07XG4gIGNvbnN0IG1lbnUgPSBNZW51LmJ1aWxkRnJvbVRlbXBsYXRlKG1lbnVUZW1wbGF0ZSk7XG4gIE1lbnUuc2V0QXBwbGljYXRpb25NZW51KG1lbnUpO1xufVxuXG5hcHAub24oXCJyZWFkeVwiLCAoKSA9PiB7XG4gIGNyZWF0ZVdpbmRvdygpO1xuICBtZW51U2V0dXAoKTtcblxuICBwb3dlck1vbml0b3Iub24oXCJyZXN1bWVcIiwgKCkgPT4ge1xuICAgIG1haW5XaW5kb3cucmVsb2FkKCk7XG4gIH0pO1xuXG4gIC8vIE9uIE1hYywgdGhpcyB3aWxsIGhpZGUgdGhlIHdpbmRvd1xuICAvLyBPbiBXaW5kb3dzLCB0aGUgYXBwIHdpbGwgY2xvc2UgYW5kIHF1aXRcbiAgbWFpbldpbmRvdy5vbihcImNsb3NlXCIsIChlKSA9PiB7XG4gICAgaWYgKHdpbGxRdWl0IHx8IHByb2Nlc3MucGxhdGZvcm0gPT09IFwid2luMzJcIikge1xuICAgICAgbWFpbldpbmRvdyA9IG51bGw7XG4gICAgICBhcHAucXVpdCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBtYWluV2luZG93LmhpZGUoKTtcbiAgICB9XG4gIH0pO1xufSk7XG5cbmFwcC5vbihcImFjdGl2YXRlXCIsICgpID0+IG1haW5XaW5kb3cuc2hvdygpKTtcbmFwcC5vbihcImJlZm9yZS1xdWl0XCIsICgpID0+ICh3aWxsUXVpdCA9IHRydWUpKTtcbiJdLCJuYW1lcyI6WyJTdG9yZSIsIkJyb3dzZXJXaW5kb3ciLCJwYXRoIiwiaXNEZXYiLCJkaWFsb2ciLCJzaGVsbCIsImFwcCIsIk5vdGlmaWNhdGlvbiIsIk1lbnUiLCJwb3dlck1vbml0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
