"use strict";
const {
  app,
  BrowserWindow,
  Menu,
  dialog,
  powerMonitor,
  shell,
  Notification
} = require("electron");
const Store = require("electron-store");
const isDev = require("electron-is-dev");
const path = require("path");
const version = "2";
require("@electron/remote/main").initialize();
const store = new Store();
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
  mainWindow = new BrowserWindow({
    width: 800,
    minWidth: 320,
    height: 600,
    fullscreenable: true,
    backgroundColor: "#403F4D",
    icon: path.join(__dirname, "assets/png/128x128.png"),
    webPreferences: {
      nodeIntegration: true
    }
  });
  mainWindow.loadURL(
    isDev ? "http://localhost:5173" : `file://${path.join(__dirname, "../build/index.html")}`
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
              message: "todometer is built by @cassidoo",
              detail: "You can find her on GitHub and Twitter as @cassidoo, or on her website cassidoo.co.",
              icon: path.join(__dirname, "assets/png/64x64.png")
            });
          }
        },
        {
          label: "Contribute (v" + version + ")",
          click: () => {
            shell.openExternal("https://github.com/cassidoo/todometer");
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
            app.quit();
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
            let exNotification = new Notification({
              title: "todometer reminder!",
              body: "Here's an example todometer notification!"
            });
            exNotification.show();
          }
        }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}
app.on("ready", () => {
  createWindow();
  menuSetup();
  powerMonitor.on("resume", () => {
    mainWindow.reload();
  });
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
app.on("activate", () => mainWindow.show());
app.on("before-quit", () => willQuit = true);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguY2pzIiwic291cmNlcyI6WyIuLi9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB7XG4gICAgYXBwLFxuICAgIEJyb3dzZXJXaW5kb3csXG4gICAgTWVudSxcbiAgICBkaWFsb2csXG4gICAgcG93ZXJNb25pdG9yLFxuICAgIHNoZWxsLFxuICAgIE5vdGlmaWNhdGlvblxuICB9ID0gcmVxdWlyZShcImVsZWN0cm9uXCIpO1xuICBjb25zdCBTdG9yZSA9IHJlcXVpcmUoXCJlbGVjdHJvbi1zdG9yZVwiKTtcbiAgY29uc3QgaXNEZXYgPSByZXF1aXJlKFwiZWxlY3Ryb24taXMtZGV2XCIpO1xuICBcbiAgY29uc3QgcGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpO1xuICBjb25zdCB2ZXJzaW9uID0gXCIyXCJcbiAgXG4gIHJlcXVpcmUoJ0BlbGVjdHJvbi9yZW1vdGUvbWFpbicpLmluaXRpYWxpemUoKVxuICBcbiAgY29uc3Qgc3RvcmUgPSBuZXcgU3RvcmUoKTtcbiAgXG4gIGdsb2JhbC5ub3RpZmljYXRpb25TZXR0aW5ncyA9IHtcbiAgICByZXNldE5vdGlmaWNhdGlvbjogc3RvcmUuZ2V0KFwicmVzZXRcIikgfHwgdHJ1ZSxcbiAgICByZW1pbmRlck5vdGlmaWNhdGlvbjogc3RvcmUuZ2V0KFwicmVtaW5kZXJcIikgfHwgXCJob3VyXCJcbiAgfTtcbiAgXG4gIGxldCBtYWluV2luZG93ID0ge1xuICAgIHNob3c6ICgpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwic2hvd1wiKTtcbiAgICB9XG4gIH07IC8vIHRlbXAgb2JqZWN0IHdoaWxlIGFwcCBsb2Fkc1xuICBsZXQgd2lsbFF1aXQgPSBmYWxzZTtcbiAgXG4gIGZ1bmN0aW9uIGNyZWF0ZVdpbmRvdygpIHtcbiAgICBtYWluV2luZG93ID0gbmV3IEJyb3dzZXJXaW5kb3coe1xuICAgICAgd2lkdGg6IDgwMCxcbiAgICAgIG1pbldpZHRoOiAzMjAsXG4gICAgICBoZWlnaHQ6IDYwMCxcbiAgICAgIGZ1bGxzY3JlZW5hYmxlOiB0cnVlLFxuICAgICAgYmFja2dyb3VuZENvbG9yOiBcIiM0MDNGNERcIixcbiAgICAgIGljb246IHBhdGguam9pbihfX2Rpcm5hbWUsIFwiYXNzZXRzL3BuZy8xMjh4MTI4LnBuZ1wiKSxcbiAgICAgIHdlYlByZWZlcmVuY2VzOiB7XG4gICAgICAgIG5vZGVJbnRlZ3JhdGlvbjogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICBcbiAgICBtYWluV2luZG93LmxvYWRVUkwoXG4gICAgICBpc0RldlxuICAgICAgICA/IFwiaHR0cDovL2xvY2FsaG9zdDo1MTczXCJcbiAgICAgICAgOiBgZmlsZTovLyR7cGF0aC5qb2luKF9fZGlybmFtZSwgXCIuLi9idWlsZC9pbmRleC5odG1sXCIpfWBcbiAgICApO1xuICB9XG4gIFxuICBmdW5jdGlvbiBtZW51U2V0dXAoKSB7XG4gICAgY29uc3QgbWVudVRlbXBsYXRlID0gW1xuICAgICAge1xuICAgICAgICBsYWJlbDogXCJ0b2RvbWV0ZXJcIixcbiAgICAgICAgc3VibWVudTogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxhYmVsOiBcIkFib3V0XCIsXG4gICAgICAgICAgICBjbGljazogKCkgPT4ge1xuICAgICAgICAgICAgICBkaWFsb2cuc2hvd01lc3NhZ2VCb3gobWFpbldpbmRvdywge1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiaW5mb1wiLFxuICAgICAgICAgICAgICAgIHRpdGxlOiBcIkFib3V0XCIsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogXCJ0b2RvbWV0ZXIgaXMgYnVpbHQgYnkgQGNhc3NpZG9vXCIsXG4gICAgICAgICAgICAgICAgZGV0YWlsOlxuICAgICAgICAgICAgICAgICAgXCJZb3UgY2FuIGZpbmQgaGVyIG9uIEdpdEh1YiBhbmQgVHdpdHRlciBhcyBAY2Fzc2lkb28sIG9yIG9uIGhlciB3ZWJzaXRlIGNhc3NpZG9vLmNvLlwiLFxuICAgICAgICAgICAgICAgIGljb246IHBhdGguam9pbihfX2Rpcm5hbWUsIFwiYXNzZXRzL3BuZy82NHg2NC5wbmdcIilcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBsYWJlbDogXCJDb250cmlidXRlICh2XCIgKyB2ZXJzaW9uICsgXCIpXCIsXG4gICAgICAgICAgICBjbGljazogKCkgPT4ge1xuICAgICAgICAgICAgICBzaGVsbC5vcGVuRXh0ZXJuYWwoXCJodHRwczovL2dpdGh1Yi5jb20vY2Fzc2lkb28vdG9kb21ldGVyXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgdHlwZTogXCJzZXBhcmF0b3JcIlxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgLyogRm9yIGRlYnVnZ2luZyAqL1xuICAgICAgICAgICAgbGFiZWw6IFwiRGV2IHRvb2xzXCIsXG4gICAgICAgICAgICBjbGljazogKCkgPT4ge1xuICAgICAgICAgICAgICBtYWluV2luZG93LndlYkNvbnRlbnRzLm9wZW5EZXZUb29scygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbGFiZWw6IFwiUXVpdFwiLFxuICAgICAgICAgICAgYWNjZWxlcmF0b3I6IFwiQ29tbWFuZE9yQ29udHJvbCtRXCIsXG4gICAgICAgICAgICBjbGljazogKCkgPT4ge1xuICAgICAgICAgICAgICBhcHAucXVpdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6IFwiRWRpdFwiLFxuICAgICAgICBzdWJtZW51OiBbXG4gICAgICAgICAgeyByb2xlOiBcInVuZG9cIiB9LFxuICAgICAgICAgIHsgcm9sZTogXCJyZWRvXCIgfSxcbiAgICAgICAgICB7IHJvbGU6IFwiY3V0XCIgfSxcbiAgICAgICAgICB7IHJvbGU6IFwiY29weVwiIH0sXG4gICAgICAgICAgeyByb2xlOiBcInBhc3RlXCIgfSxcbiAgICAgICAgICB7IHJvbGU6IFwiZGVsZXRlXCIgfSxcbiAgICAgICAgICB7IHJvbGU6IFwic2VsZWN0YWxsXCIgfVxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogXCJWaWV3XCIsXG4gICAgICAgIHN1Ym1lbnU6IFtcbiAgICAgICAgICAvLyB7XG4gICAgICAgICAgLy8gICBsYWJlbDogXCJMaWdodCBtb2RlXCIsXG4gICAgICAgICAgLy8gICB0eXBlOiBcImNoZWNrYm94XCIsXG4gICAgICAgICAgLy8gICBjaGVja2VkOiBmYWxzZSxcbiAgICAgICAgICAvLyAgIGNsaWNrOiBlID0+IHtcbiAgICAgICAgICAvLyAgICAgbWFpbldpbmRvdy5pc0xpZ2h0TW9kZSA9IGUuY2hlY2tlZDtcbiAgICAgICAgICAvLyAgIH1cbiAgICAgICAgICAvLyB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHR5cGU6IFwic2VwYXJhdG9yXCJcbiAgICAgICAgICB9LFxuICAgICAgICAgIHsgcm9sZTogXCJyZWxvYWRcIiB9LFxuICAgICAgICAgIHsgcm9sZTogXCJ0b2dnbGVmdWxsc2NyZWVuXCIgfSxcbiAgICAgICAgICB7IHJvbGU6IFwibWluaW1pemVcIiB9LFxuICAgICAgICAgIHsgcm9sZTogXCJjbG9zZVwiIH1cbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6IFwiTm90aWZpY2F0aW9uc1wiLFxuICAgICAgICBzdWJtZW51OiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbGFiZWw6IFwiRW5hYmxlIHJlc2V0IG5vdGlmaWNhdGlvblwiLFxuICAgICAgICAgICAgdHlwZTogXCJjaGVja2JveFwiLFxuICAgICAgICAgICAgY2hlY2tlZDogc3RvcmUuZ2V0KFwicmVzZXRcIiksXG4gICAgICAgICAgICBjbGljazogZSA9PiB7XG4gICAgICAgICAgICAgIGdsb2JhbC5ub3RpZmljYXRpb25TZXR0aW5ncy5yZXNldE5vdGlmaWNhdGlvbiA9IGUuY2hlY2tlZDtcbiAgICAgICAgICAgICAgc3RvcmUuc2V0KFwicmVzZXRcIiwgZS5jaGVja2VkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxhYmVsOiBcIlJlbWluZGVyIG5vdGlmaWNhdGlvbnNcIixcbiAgICAgICAgICAgIHN1Ym1lbnU6IFtcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxhYmVsOiBcIk5ldmVyXCIsXG4gICAgICAgICAgICAgICAgdHlwZTogXCJyYWRpb1wiLFxuICAgICAgICAgICAgICAgIGNoZWNrZWQ6IHN0b3JlLmdldChcInJlbWluZGVyXCIpID09PSBcIm5ldmVyXCIsXG4gICAgICAgICAgICAgICAgY2xpY2s6IGUgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKGUuY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgICAgICBnbG9iYWwubm90aWZpY2F0aW9uU2V0dGluZ3MucmVtaW5kZXJOb3RpZmljYXRpb24gPSBcIm5ldmVyXCI7XG4gICAgICAgICAgICAgICAgICAgIHN0b3JlLnNldChcInJlbWluZGVyXCIsIFwibmV2ZXJcIik7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiRXZlcnkgMTUgbWludXRlc1wiLFxuICAgICAgICAgICAgICAgIHR5cGU6IFwicmFkaW9cIixcbiAgICAgICAgICAgICAgICBjaGVja2VkOiBzdG9yZS5nZXQoXCJyZW1pbmRlclwiKSA9PT0gXCJxdWFydGVyaG91clwiLFxuICAgICAgICAgICAgICAgIGNsaWNrOiBlID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChlLmNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZ2xvYmFsLm5vdGlmaWNhdGlvblNldHRpbmdzLnJlbWluZGVyTm90aWZpY2F0aW9uID0gXCJxdWFydGVyaG91clwiO1xuICAgICAgICAgICAgICAgICAgICBzdG9yZS5zZXQoXCJyZW1pbmRlclwiLCBcInF1YXJ0ZXJob3VyXCIpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxhYmVsOiBcIkV2ZXJ5IDMwIG1pbnV0ZXNcIixcbiAgICAgICAgICAgICAgICB0eXBlOiBcInJhZGlvXCIsXG4gICAgICAgICAgICAgICAgY2hlY2tlZDogc3RvcmUuZ2V0KFwicmVtaW5kZXJcIikgPT09IFwiaGFsZmhvdXJcIixcbiAgICAgICAgICAgICAgICBjbGljazogZSA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAoZS5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIGdsb2JhbC5ub3RpZmljYXRpb25TZXR0aW5ncy5yZW1pbmRlck5vdGlmaWNhdGlvbiA9IFwiaGFsZmhvdXJcIjtcbiAgICAgICAgICAgICAgICAgICAgc3RvcmUuc2V0KFwicmVtaW5kZXJcIiwgXCJoYWxmaG91clwiKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJFdmVyeSBob3VyXCIsXG4gICAgICAgICAgICAgICAgdHlwZTogXCJyYWRpb1wiLFxuICAgICAgICAgICAgICAgIGNoZWNrZWQ6IHN0b3JlLmdldChcInJlbWluZGVyXCIpID09PSBcImhvdXJcIixcbiAgICAgICAgICAgICAgICBjbGljazogZSA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAoZS5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIG1haW5XaW5kb3cucmVtaW5kZXJOb3RpZmljYXRpb24gPSBcImhvdXJcIjtcbiAgICAgICAgICAgICAgICAgICAgc3RvcmUuc2V0KFwicmVtaW5kZXJcIiwgXCJob3VyXCIpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXVxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbGFiZWw6IFwiU2hvdyBleGFtcGxlIG5vdGlmaWNhdGlvblwiLFxuICAgICAgICAgICAgY2xpY2s6IGUgPT4ge1xuICAgICAgICAgICAgICBsZXQgZXhOb3RpZmljYXRpb24gPSBuZXcgTm90aWZpY2F0aW9uKHtcbiAgICAgICAgICAgICAgICB0aXRsZTogXCJ0b2RvbWV0ZXIgcmVtaW5kZXIhXCIsXG4gICAgICAgICAgICAgICAgYm9keTogXCJIZXJlJ3MgYW4gZXhhbXBsZSB0b2RvbWV0ZXIgbm90aWZpY2F0aW9uIVwiXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBleE5vdGlmaWNhdGlvbi5zaG93KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9XG4gICAgXTtcbiAgICBjb25zdCBtZW51ID0gTWVudS5idWlsZEZyb21UZW1wbGF0ZShtZW51VGVtcGxhdGUpO1xuICAgIE1lbnUuc2V0QXBwbGljYXRpb25NZW51KG1lbnUpO1xuICB9XG4gIFxuICBhcHAub24oXCJyZWFkeVwiLCAoKSA9PiB7XG4gICAgY3JlYXRlV2luZG93KCk7XG4gICAgbWVudVNldHVwKCk7XG4gIFxuICAgIHBvd2VyTW9uaXRvci5vbihcInJlc3VtZVwiLCAoKSA9PiB7XG4gICAgICBtYWluV2luZG93LnJlbG9hZCgpO1xuICAgIH0pO1xuICBcbiAgICAvLyBPbiBNYWMsIHRoaXMgd2lsbCBoaWRlIHRoZSB3aW5kb3dcbiAgICAvLyBPbiBXaW5kb3dzLCB0aGUgYXBwIHdpbGwgY2xvc2UgYW5kIHF1aXRcbiAgICBtYWluV2luZG93Lm9uKFwiY2xvc2VcIiwgZSA9PiB7XG4gICAgICBpZiAod2lsbFF1aXQgfHwgcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gXCJ3aW4zMlwiKSB7XG4gICAgICAgIG1haW5XaW5kb3cgPSBudWxsO1xuICAgICAgICBhcHAucXVpdCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBtYWluV2luZG93LmhpZGUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG4gIFxuICBhcHAub24oXCJhY3RpdmF0ZVwiLCAoKSA9PiBtYWluV2luZG93LnNob3coKSk7XG4gIGFwcC5vbihcImJlZm9yZS1xdWl0XCIsICgpID0+ICh3aWxsUXVpdCA9IHRydWUpKTtcbiAgIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxNQUFNO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNKLElBQU0sUUFBUSxVQUFVO0FBQ3RCLE1BQU0sUUFBUSxRQUFRLGdCQUFnQjtBQUN0QyxNQUFNLFFBQVEsUUFBUSxpQkFBaUI7QUFFdkMsTUFBTSxPQUFPLFFBQVEsTUFBTTtBQUMzQixNQUFNLFVBQVU7QUFFaEIsUUFBUSx1QkFBdUIsRUFBRSxXQUFZO0FBRTdDLE1BQU0sUUFBUSxJQUFJO0FBRWxCLE9BQU8sdUJBQXVCO0FBQUEsRUFDNUIsbUJBQW1CLE1BQU0sSUFBSSxPQUFPLEtBQUs7QUFBQSxFQUN6QyxzQkFBc0IsTUFBTSxJQUFJLFVBQVUsS0FBSztBQUNuRDtBQUVFLElBQUksYUFBYTtBQUFBLEVBQ2YsTUFBTSxNQUFNO0FBQ1YsWUFBUSxJQUFJLE1BQU07QUFBQSxFQUNuQjtBQUNMO0FBQ0UsSUFBSSxXQUFXO0FBRWYsU0FBUyxlQUFlO0FBQ3RCLGVBQWEsSUFBSSxjQUFjO0FBQUEsSUFDN0IsT0FBTztBQUFBLElBQ1AsVUFBVTtBQUFBLElBQ1YsUUFBUTtBQUFBLElBQ1IsZ0JBQWdCO0FBQUEsSUFDaEIsaUJB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
